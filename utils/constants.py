from typing import Optional

from models.agent_model import (
    AgentModel,
    LLMConfig,
    LLMProvider,
    STTConfig,
    STTProvider,
    TTSConfig,
    TTSProvider,
)

default_voice_instructions = (
    "Use a friendly and engaging tone. Speak clearly and at a moderate pace."
)


def get_default_agent_model(
    prompt: str,
    voice_instructions: Optional[str] = None,
) -> AgentModel:
    """Return a default AgentModel configuration."""
    return AgentModel(
        llm=LLMConfig(
            temperature=0.7,
            prompt=prompt,
            max_tokens=2000,
            model_id="gemini-2.5-flash",
            provider=LLMProvider.google,
        ),
        tts=TTSConfig(
            provider=TTSProvider.openai,
            model_id="gpt-4o-mini-tts",
            voice_id="alloy",
            voice_instructions=voice_instructions or default_voice_instructions,
        ),
        stt=STTConfig(
            provider=STTProvider.deepgram,
        ),
        first_message="Hello! How can I assist you today?",
    )
