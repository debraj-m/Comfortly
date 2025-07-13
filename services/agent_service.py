import asyncio
import os
from typing import Optional, Union

import aiohttp
from loguru import logger
from pipecat.audio.vad.silero import SileroVADAnalyzer
from pipecat.frames.frames import Frame, TTSSpeakFrame
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.runner import PipelineRunner
from pipecat.pipeline.task import PipelineParams, PipelineTask
from pipecat.processors.aggregators.openai_llm_context import OpenAILLMContext
from pipecat.processors.frame_processor import FrameDirection, FrameProcessor
from pipecat.services.google.llm import GoogleLLMService, LLMSearchResponseFrame
from pipecat.transports.base_transport import TransportParams
from pipecat.transports.network.small_webrtc import SmallWebRTCTransport
import platform
# Import Daily and RTVI modules conditionally
USE_DAILY = os.getenv("USE_DAILY", "").lower() == "true"
if USE_DAILY:
    from pipecat.processors.frameworks.rtvi import RTVIConfig, RTVIProcessor
    from pipecat.services.google.rtvi import GoogleRTVIObserver
    from pipecat.transports.services.daily import DailyParams, DailyTransport

from models.agent_model import AgentModel, LLMProvider, STTProvider, TTSProvider
from models.user import UserInfo
from repositories.user_repository import UserRepository
from services.prompt_service import PromptService, PromptType
from services.providers_service import Providers, ProvidersService
from services.user_memory_service import UserMemoryService
from utils.constants import get_default_agent_model


class LLMSearchLoggerProcessor(FrameProcessor):
    """Processor to log LLM search responses."""

    async def process_frame(self, frame: Frame, direction: FrameDirection):
        await super().process_frame(frame, direction)

        if isinstance(frame, LLMSearchResponseFrame):
            logger.info(f"LLM Search Response: {frame}")

        await self.push_frame(frame)


class AgentService:
    """General purpose Agent Service for creating and running conversational AI bots."""

    def __init__(
        self,
        user_info: Optional[UserInfo] = None,
    ):

        self.user_info = user_info
        self.task: Optional[PipelineTask] = None
        self.runner: Optional[PipelineRunner] = None

    async def initialize(self, transport, user_info: Optional[UserInfo] = None):
        """Initialize the agent with all necessary components."""
        logger.info("Initializing Comfortly Agent...")

        # Create transport

        # Create services
        # Use the default prompt type for now, can be customized based on user_info later
        self.prompt = PromptService.SYSTEM_PROMPTS[PromptType.DEFAULT]

        default_config = get_default_agent_model(prompt=self.prompt)
        self.agent_config = default_config

        stt = ProvidersService.get_stt_service(
            provider=default_config.stt.provider,
            model_id=default_config.stt.model_id,
            language=default_config.stt.language,
            alternative_languages=default_config.stt.alternative_languages,
        )
        tts = ProvidersService.get_tts_service(
            provider=default_config.tts.provider,
            model_id=default_config.tts.model_id,
            voice_id=default_config.tts.voice_id,
            voice_instructions=default_config.tts.voice_instructions,
        )
        llm = ProvidersService.get_llm_service(
            provider=default_config.llm.provider,
            model_id=default_config.llm.model_id,
            temperature=default_config.llm.temperature,
            max_tokens=default_config.llm.max_tokens,
        )
        # Create context with system prompt
        system_prompt = self.prompt
        context = ProvidersService.create_context(
            default_config.llm.provider,
            OpenAILLMContext([{"role": "system", "content": system_prompt}]),
        )
        context_aggregator = llm.create_context_aggregator(context)
        self.context = context
        self.context_aggregator = context_aggregator

        # Create processors
        llm_search_logger = LLMSearchLoggerProcessor()

        # Initialize pipeline components
        pipeline_components = [
            transport.input(),
            stt,
            context_aggregator.user(),
            llm,
            llm_search_logger,
            tts,
            transport.output(),
            context_aggregator.assistant(),
        ]

        rtvi = None
        if (
            USE_DAILY
            and "DailyTransport" in globals()
            and isinstance(transport, DailyTransport)
        ):
            rtvi = RTVIProcessor(config=RTVIConfig(config=[]))
            # Insert rtvi after stt in the pipeline components
            pipeline_components.insert(2, rtvi)

        # Create pipeline
        pipeline = Pipeline(pipeline_components)

        # Store the pipeline as an attribute for later use
        self.pipeline = pipeline

        # Create task with appropriate observers based on configuration
        observers = []
        if USE_DAILY and rtvi and self.agent_config.llm.provider == LLMProvider.google:
            observers = [GoogleRTVIObserver(rtvi)]

        self.task = PipelineTask(
            self.pipeline,
            params=PipelineParams(
                enable_metrics=True,
                enable_usage_metrics=True,
            ),
            observers=observers,
        )

        # Set up event handlers
        self._setup_event_handlers(transport, rtvi)

        # Create runner
        self.runner = PipelineRunner(
            handle_sigint=False
        )

        logger.info("Agent initialized successfully")

    def _setup_event_handlers(
        self,
        transport,
        rtvi=None,
    ):
        """Set up event handlers for the agent."""
        # Check if we're using Daily transport and if it's available
        if (
            USE_DAILY
            and "DailyTransport" in globals()
            and isinstance(transport, DailyTransport)
            and rtvi
        ):
            # Set up Daily-specific event handlers
            @rtvi.event_handler("on_client_ready")
            async def on_client_ready(rtvi):
                await rtvi.set_bot_ready()
                await self.task.queue_frames(
                    [TTSSpeakFrame(text=self.agent_config.first_message)]
                )
                logger.info("Client ready, conversation started")

            @transport.event_handler("on_first_participant_joined")
            async def on_first_participant_joined(transport, participant):
                logger.info(
                    f"First participant joined: {participant.get('id', 'unknown')}"
                )

            @transport.event_handler("on_participant_left")
            async def on_participant_left(transport, participant, reason):
                logger.info(
                    f"Participant left: {participant.get('id', 'unknown')}, reason: {reason}"
                )
                messages = self.context.get_messages_for_persistent_storage()
                user_mem_service = UserMemoryService()
                memory = user_mem_service.create_user_memory(
                    messages, self.user_info.context
                )
                UserRepository().update_user_context(
                    userId=self.user_info.id, updatedContext=memory
                )
                await self.task.cancel()

        else:
            print("Using SmallWebRTCTransport or no Daily transport available")
            # Set up WebRTC event handlers
            @transport.event_handler("on_client_ready")
            async def on_client_ready(rtvi):
                await self.task.queue_frames(
                    [self.context_aggregator.user().get_context_frame()]
                )
                await self.task.queue_frames(
                    [TTSSpeakFrame(text=self.agent_config.first_message)]
                )
                logger.info("Client ready, conversation started")

            @transport.event_handler("on_disconnected")
            async def on_disconnected(transport, reason):
                logger.info(f"Transport disconnected: {reason}")
                messages = self.context.get_messages_for_persistent_storage()
                user_mem_service = UserMemoryService()
                memory = user_mem_service.create_user_memory(
                    messages, self.user_info.context
                )
                UserRepository().update_user_context(
                    userId=self.user_info.id, updatedContext=memory
                )
                await self.task.cancel()

    async def run(self):
        """Run the agent."""
        if not self.task or not self.runner:
            raise RuntimeError("Agent not initialized. Call initialize() first.")

        logger.info("Starting Comfortly Agent...")

        try:
            await self.runner.run(self.task)
        except Exception as e:
            logger.error(f"Error running agent: {e}")
            raise
        finally:
            logger.info("Agent stopped")

    async def stop(self):
        """Stop the agent."""
        if self.task:
            await self.task.cancel()
            logger.info("Agent stopped")

    @classmethod
    async def create_and_run(
        cls,
        room_url: str,
        token: str,
        agent_config: AgentModel,
        user_info: Optional[UserInfo] = None,
    ):
        """Factory method to create and run an agent in one call."""
        if not USE_DAILY:
            raise ValueError(
                "Daily feature is not enabled. Set USE_DAILY=true to enable it."
            )

        agent = cls(user_info=user_info)

        # Get the appropriate transport
        from services.providers_service import ProvidersService

        transport = ProvidersService.get_daily_transport(room_url, token)

        await agent.initialize(transport, user_info)
        await agent.run()
        return agent
