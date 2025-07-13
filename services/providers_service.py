import os
from enum import Enum

from loguru import logger
from pipecat.audio.vad.silero import SileroVADAnalyzer
from pipecat.services.openai.llm import OpenAILLMContext
from pipecat.transports.base_transport import TransportParams
from pipecat.transports.network.small_webrtc import SmallWebRTCTransport

# Import Daily modules conditionally
USE_DAILY = os.getenv("USE_DAILY", "").lower() == "true"
if USE_DAILY:
    from pipecat.transports.services.daily import DailyParams, DailyTransport

from models.agent_model import AgentModel, LLMProvider, STTProvider, TTSProvider


class Providers(Enum):
    LLM = "llm"
    TTS = "tts"
    STT = "stt"


class ProvidersService:
    @staticmethod
    def getProviders(provider_type: Providers):
        """Return available providers for the given type."""
        if provider_type == Providers.LLM:
            return ["google", "openai"]
        elif provider_type == Providers.TTS:
            return ["google", "openai"]
        elif provider_type == Providers.STT:
            return ["google", "deepgram"]
        return []

    @staticmethod
    def get_llm_service(
        provider: LLMProvider,
        model_id: str,
        temperature: float = None,
        max_tokens: int = None,
    ):
        """Create LLM service based on configuration"""

        if provider == LLMProvider.google:
            from pipecat.services.google.llm import GoogleLLMService

            return GoogleLLMService(
                model=model_id,
                api_key=os.getenv("GOOGLE_API_KEY"),
                temperature=temperature,
                max_tokens=max_tokens,
            )

        elif provider == LLMProvider.openai:
            from pipecat.services.openai.llm import OpenAILLMService

            return OpenAILLMService(
                model=model_id,
                api_key=os.getenv("OPENAI_API_KEY"),
                temperature=temperature,
                max_tokens=max_tokens,
            )

        logger.warning(f"Unrecognized LLM provider {name}, using Google")
        from pipecat.services.google.llm import GoogleLLMService

        return GoogleLLMService(
            api_key=os.getenv("GOOGLE_API_KEY"),
            model=model_id,
            temperature=temperature,
            max_tokens=max_tokens,
        )

    @staticmethod
    def get_stt_service(
        provider: STTProvider,
        model_id: str = None,
        language: str = "en-US",
        alternative_languages: list = None,
    ):
        """Create STT service based on configuration"""
        from deepgram.clients.live import LiveOptions
        from pipecat.services.deepgram.stt import DeepgramSTTService

        if provider == STTProvider.google:
            from pipecat.services.google.stt import GoogleSTTService

            return GoogleSTTService(
                credentials=os.getenv("GOOGLE_APPLICATION_CREDENTIALS"),
                params=GoogleSTTService.InputParams(languages=alternative_languages),
            )

        return DeepgramSTTService(
            api_key=os.getenv("DEEPGRAM_API_KEY"),
            audio_passthrough=True,
            live_options=LiveOptions(
                filler_words=True,
                smart_format=True,
                model=model_id or "nova-3",
                numerals=True,
                punctuate=True,
                endpointing=10,
                language=language or "multi",
            ),
        )

    @staticmethod
    def get_tts_service(
        provider: TTSProvider = TTSProvider.google,
        model_id: str = None,
        voice_id: str = None,
        voice_instructions: str = None,
    ):
        """Create TTS service based on configuration"""
        from pipecat.services.openai.tts import OpenAITTSService

        if provider == TTSProvider.openai:
            return OpenAITTSService(
                model=model_id or "gpt-4o-mini-tts",
                api_key=os.getenv("OPENAI_API_KEY"),
                instructions=voice_instructions,
                voice_id=voice_id,
            )

        else:

            from pipecat.services.google.tts import GoogleTTSService
            from pipecat.services.openai.tts import OpenAITTSService

            # If a voice_id is provided like "en-IN-Chirp-HD-F", extract language code ("en-IN")
            extracted_language = None
            if voice_id and "-" in voice_id:
                extracted_language = "-".join(voice_id.split("-")[:2])

                return GoogleTTSService(
                    voice_id=voice_id,
                    params=GoogleTTSService.InputParams(
                        language=extracted_language,
                        google_style="calm",
                    ),
                )

    @staticmethod
    def create_context(provider: LLMProvider, context: OpenAILLMContext):
        """Create LLM context based on configuration"""

        if provider == LLMProvider.google:
            from pipecat.services.google.llm import GoogleLLMContext

            return GoogleLLMContext.upgrade_to_google(context)

        return context

    @staticmethod
    def get_small_webrtc_transport(webrtc_connection):
        return SmallWebRTCTransport(
            webrtc_connection=webrtc_connection,
            params=TransportParams(
                audio_in_enabled=True,
                audio_out_enabled=True,
                vad_analyzer=SileroVADAnalyzer(),
                audio_out_10ms_chunks=2,
            ),
        )

    @staticmethod
    def get_daily_transport(room_url: str, token: str):
        """Get a Daily transport with the specified parameters.

        This will only work if USE_DAILY is set to true in the environment.
        """
        if not USE_DAILY:
            raise ValueError(
                "Daily feature is not enabled. Set USE_DAILY=true to enable it."
            )

        return DailyTransport(
            room_url,
            token,
            "Comfortly Agent",
            DailyParams(
                audio_in_enabled=True,
                audio_out_enabled=True,
                vad_analyzer=SileroVADAnalyzer(),
            ),
        )
