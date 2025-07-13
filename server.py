import argparse
import asyncio
import logging
import os
from contextlib import asynccontextmanager
from typing import Any, Dict

import aiohttp
from dotenv import load_dotenv
from fastapi import BackgroundTasks, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from jwt.exceptions import InvalidTokenError
from pipecat.transports.network.small_webrtc import SmallWebRTCTransport
from pipecat.transports.network.webrtc_connection import (
    IceServer,
    SmallWebRTCConnection,
)
from dotenv import load_dotenv

load_dotenv()
# Import Daily-related modules conditionally
USE_DAILY = os.getenv("USE_DAILY", "").lower() == "true"

if USE_DAILY:
    from pipecat.transports.services.helpers.daily_rest import (
        DailyRESTHelper,
        DailyRoomParams,
    )

from models.agent_model import (
    AgentModel,
    LLMConfig,
    LLMProvider,
    STTConfig,
    STTProvider,
    TTSConfig,
    TTSProvider,
)
from models.user import Gender, UserInfo
from repositories.user_repository import UserRepository
from services.agent_service import AgentService
from services.providers_service import ProvidersService
from services.token_service import TokenService
from utils.constants import get_default_agent_model

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Dictionary to track bot tasks: {task_id: asyncio.Task}
bot_tasks = {}

# Store Daily API helpers
daily_helpers = {}


# Store connections by pc_id
pcs_map: Dict[str, SmallWebRTCConnection] = {}


ice_servers = [
    IceServer(
        urls="stun:stun.l.google.com:19302",
    )
]


def cleanup():
    """Cleanup function to cancel all bot tasks.

    Called during server shutdown.
    """
    for task_id, task in bot_tasks.items():
        if not task.done():
            task.cancel()
        logger.info(f"Cancelled bot task {task_id}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """FastAPI lifespan manager that handles startup and shutdown tasks.

    - Creates aiohttp session
    - Initializes Daily API helper (if USE_DAILY is true)
    - Cleans up resources on shutdown
    """
    aiohttp_session = aiohttp.ClientSession()

    # Initialize Daily API helper only if USE_DAILY is true
    if USE_DAILY:
        daily_helpers["rest"] = DailyRESTHelper(
            daily_api_key=os.getenv("DAILY_API_KEY", ""),
            daily_api_url=os.getenv("DAILY_API_URL", "https://api.daily.co/v1"),
            aiohttp_session=aiohttp_session,
        )

    yield
    await aiohttp_session.close()
    coros = [pc.disconnect() for pc in pcs_map.values()]
    await asyncio.gather(*coros)
    pcs_map.clear()
    cleanup()


# Initialize FastAPI app with lifespan manager
app = FastAPI(lifespan=lifespan)


@app.get("/health")
def read_root():
    return "Working!"


# Configure CORS to allow requests from any origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def create_room_and_token() -> tuple[str, str]:
    """Helper function to create a Daily room and generate an access token.

    Returns:
        tuple[str, str]: A tuple containing (room_url, token)

    Raises:
        HTTPException: If room creation or token generation fails or if USE_DAILY is false
    """
    if not USE_DAILY:
        raise HTTPException(
            status_code=500,
            detail="Daily feature is not enabled. Set USE_DAILY=true to enable it.",
        )

    room = await daily_helpers["rest"].create_room(DailyRoomParams())
    if not room.url:
        raise HTTPException(status_code=500, detail="Failed to create room")

    token = await daily_helpers["rest"].get_token(room.url)
    if not token:
        raise HTTPException(
            status_code=500, detail=f"Failed to get token for room: {room.url}"
        )

    return room.url, token


async def run_webrtc_agent_service(
    webrtc_connection: SmallWebRTCConnection, user_info: UserInfo = None
):
    """Run the agent service for a specific room.

    Args:
        webrtc_connection: The SmallWebRTCConnection instance
        user_info: Optional user information for personalization
    """
    try:
        # Get default agent configuration

        # Create and run the agent service
        agent = AgentService(
            user_info=user_info,
        )
        transport = ProvidersService.get_small_webrtc_transport(webrtc_connection)
        await agent.initialize(transport, user_info)
        await agent.run()

    except Exception as e:
        logger.error(f"Error running agent service: {e}")
        raise


async def run_agent_service(room_url: str, token: str, user_info: UserInfo = None):
    """Run the agent service for a specific room.

    Args:
        room_url: The Daily room URL
        token: The Daily room token
        user_info: Optional user information for personalization
    """
    if not USE_DAILY:
        raise HTTPException(
            status_code=500,
            detail="Daily feature is not enabled. Set USE_DAILY=true to enable it.",
        )

    try:
        # Get default agent configuration

        # Create and run the agent service
        agent = AgentService(
            user_info=user_info,
        )
        transport = ProvidersService.get_daily_transport(room_url, token)
        await agent.initialize(transport, user_info)
        await agent.run()

    except Exception as e:
        logger.error(f"Error running agent service: {e}")
        raise
    finally:
        # Clean up the task from tracking
        task_id = f"{room_url}_{token}"
        if task_id in bot_tasks:
            del bot_tasks[task_id]


@app.post("/connect")
async def bot_connect(request: Request) -> Dict[Any, Any]:
    """Connect endpoint that creates a room and returns connection credentials.

    This endpoint is called by client to establish a connection.

    Returns:
        Dict[Any, Any]: Authentication bundle containing room_url and token

    Raises:
        HTTPException: If room creation, token generation, or bot startup fails
    """
    if not USE_DAILY:
        raise HTTPException(
            status_code=500,
            detail="Daily feature is not enabled. Set USE_DAILY=true to enable it.",
        )

    # Initialize TokenService
    token_service = TokenService()

    # Extract and verify the Authorization token
    auth_header = request.query_params.get("token")

    if not auth_header:
        raise HTTPException(
            status_code=401, detail="Authorization header missing or invalid"
        )

    token = auth_header
    try:
        decoded_payload = token_service.verify_token(token)
        logger.info(f"Token verified successfully: {decoded_payload}")
    except InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {e}")

    logger.info("Creating room for RTVI connection")
    room_url, token = await create_room_and_token()
    logger.info(f"Room URL: {room_url}")

    # Start the agent service as an asyncio task
    try:
        task_id = f"{room_url}_{token}"
        user_data = UserRepository().get_user_info(decoded_payload.get("sub"))
        print(f"User info: {user_data}")

        user_info = UserInfo(**user_data)
        task = asyncio.create_task(run_agent_service(room_url, token, user_info))
        bot_tasks[task_id] = task
        logger.info(f"Started agent service task {task_id}")
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to start agent service: {e}"
        )

    # Return the authentication bundle in format expected by DailyTransport
    return {"room_url": room_url, "token": token}


@app.get("/")
async def serve_index():
    return FileResponse("index.html")


@app.post("/disconnect/{task_id}")
async def bot_disconnect(task_id: str) -> Dict[str, str]:
    """Disconnect endpoint to manually stop a specific bot task.

    Args:
        task_id: The task ID to disconnect

    Returns:
        Dict[str, str]: Status message
    """
    if task_id not in bot_tasks:
        raise HTTPException(status_code=404, detail="Task not found")

    task = bot_tasks[task_id]
    if not task.done():
        task.cancel()
        logger.info(f"Cancelled bot task {task_id}")

    del bot_tasks[task_id]
    return {"status": "disconnected", "task_id": task_id}


@app.get("/status")
async def get_status() -> Dict[str, Any]:
    """Get the current status of all bot tasks.

    Returns:
        Dict[str, Any]: Status information
    """
    active_tasks = []
    completed_tasks = []

    for task_id, task in bot_tasks.items():
        if task.done():
            completed_tasks.append(
                {
                    "task_id": task_id,
                    "status": "completed",
                    "exception": str(task.exception()) if task.exception() else None,
                }
            )
        else:
            active_tasks.append({"task_id": task_id, "status": "running"})

    return {
        "active_tasks": active_tasks,
        "completed_tasks": completed_tasks,
        "total_tasks": len(bot_tasks),
    }


@app.post("/api/offer")
async def offer(request: Request, background_tasks: BackgroundTasks):
    data = await request.json()
    pc_id = data.get("pc_id")

    if pc_id and pc_id in pcs_map:
        pipecat_connection = pcs_map[pc_id]
        logger.info(f"Reusing existing connection for pc_id: {pc_id}")
        await pipecat_connection.renegotiate(sdp=request["sdp"], type=request["type"])
    else:
        # Initialize TokenService
        token_service = TokenService()

        # Extract and verify the Authorization token
        auth_header = request.query_params.get("token")

        if not auth_header:
            raise HTTPException(
                status_code=401, detail="Authorization header missing or invalid"
            )

        token = auth_header
        try:
            decoded_payload = token_service.verify_token(token)
            logger.info(f"Token verified successfully: {decoded_payload}")
        except InvalidTokenError as e:
            raise HTTPException(status_code=401, detail=f"Invalid token: {e}")

        pipecat_connection = SmallWebRTCConnection(ice_servers)
        await pipecat_connection.initialize(sdp=data["sdp"], type=data["type"])

        @pipecat_connection.event_handler("closed")
        async def handle_disconnected(webrtc_connection: SmallWebRTCConnection):
            logger.info(
                f"Discarding peer connection for pc_id: {webrtc_connection.pc_id}"
            )
            pcs_map.pop(webrtc_connection.pc_id, None)

        user_data = UserRepository().get_user_info(decoded_payload.get("sub"))
        user_info = UserInfo(**user_data)
        task = asyncio.create_task(
            run_webrtc_agent_service(
                webrtc_connection=pipecat_connection, user_info=user_info
            )
        )
        background_tasks.add_task(task)

    answer = pipecat_connection.get_answer()
    # Updating the peer connection inside the map
    pcs_map[answer["pc_id"]] = pipecat_connection

    return answer


if __name__ == "__main__":
    # Parse command line arguments for server configuration
    default_host = os.getenv("HOST", "0.0.0.0")
    default_port = int(os.getenv("FAST_API_PORT", "7860"))

    parser = argparse.ArgumentParser(
        description="Daily Travel Companion FastAPI server"
    )
    parser.add_argument("--host", type=str, default=default_host, help="Host address")
    parser.add_argument("--port", type=int, default=default_port, help="Port number")
    parser.add_argument("--reload", action="store_true", help="Reload code on change")

    config = parser.parse_args()

    # Start the FastAPI server
    import uvicorn

    uvicorn.run(
        "server:app",
        host=config.host,
        port=config.port,
        reload=config.reload,
    )
