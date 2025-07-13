from enum import Enum
from typing import List, Optional

from pydantic import BaseModel


class LLMProvider(str, Enum):
    google = "google"
    openai = "openai"


class TTSProvider(str, Enum):
    google = "google"
    openai = "openai"


class STTProvider(str, Enum):
    google = "google"
    deepgram = "deepgram"


class LLMConfig(BaseModel):
    temperature: Optional[float] = None
    prompt: Optional[str] = None
    max_tokens: Optional[int] = None
    model_id: Optional[str] = None
    provider: LLMProvider = LLMProvider.google


class TTSConfig(BaseModel):
    provider: TTSProvider = TTSProvider.openai
    model_id: Optional[str] = None
    voice_id: Optional[str] = None
    voice_instructions: Optional[str] = None


class STTConfig(BaseModel):
    provider: STTProvider = STTProvider.deepgram
    model_id: Optional[str] = None
    language: Optional[str] = None
    alternative_languages: Optional[List[str]] = None


class AgentModel(BaseModel):
    llm: LLMConfig
    tts: TTSConfig
    stt: STTConfig
    first_message: Optional[str] = None
