import json
import os
from datetime import datetime
from typing import Any, Dict, List, Optional

from google import genai
from google.genai import types
from google.genai.types import HttpOptions


class UserMemoryService:
    def __init__(self):
        """
        Initialize the UserMemoryService with Google Generative AI client.
        """
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY environment variable is not set")

        self.client = genai.Client(api_key=api_key)

    def create_user_memory(
        self,
        conversation_messages: List[str],
        current_user_memory: str = "",
    
    ) -> str:
        """
        Create a concise user memory from conversation messages and existing user memory.

        Args:
            conversation_messages (List[str]): List of conversation messages.
            current_user_memory (str): Existing user memory.
            user_context (Optional[Dict[str, Any]]): Additional user context like timezone, preferences, etc.

        Returns:
            str: A concise user memory not exceeding 3000 tokens.
        """
        # Get current date and time
        current_datetime = datetime.now()
        current_date = current_datetime.strftime("%Y-%m-%d")
        current_time = current_datetime.strftime("%H:%M:%S")
        current_day = current_datetime.strftime("%A")

      
        # Format conversation messages for better processing
        formatted_conversation = str(
            conversation_messages
        )

        # Create system instruction with improved prompt
        system_instruction = types.Content(
            role="user",
            parts=[
                types.Part.from_text(
                    text=self._get_system_prompt(
                        current_date, current_time, current_day
                    )
                )
            ],
        )

        # Prepare input content
        input_parts = []

        # Add current memory if exists
        if current_user_memory.strip():
            input_parts.append(f"=== EXISTING MEMORY ===\n{current_user_memory}\n")

       

        # Add conversation
        input_parts.append(f"=== NEW CONVERSATION ===\n{formatted_conversation}")

        # Combine all input content
        combined_input = "\n".join(input_parts)

        # Create content structure
        content = types.Content(
            role="user",
            parts=[types.Part.from_text(text=combined_input)],
        )

        # Generate concise memory using Google Generative AI
        generate_content_config = types.GenerateContentConfig(
            thinking_config=types.ThinkingConfig(thinking_budget=-1),
            response_mime_type="text/plain",
            max_output_tokens=3000,
            temperature=0.3,  # Lower temperature for more consistent outputs
        )

        try:
            response = self.client.models.generate_content(
                model="gemini-2.5-pro",
                contents=[system_instruction, content],
                config=generate_content_config,
            )

            # Extract and return the generated memory
            return response.text.strip()

        except Exception as e:
            print(f"Error generating memory: {e}")
            return current_user_memory  # Return existing memory if generation fails


    def _get_system_prompt(
        self, current_date: str, current_time: str, current_day: str
    ) -> str:
        """
        Generate the system prompt for memory creation.

        Args:
            current_date (str): Current date in YYYY-MM-DD format.
            current_time (str): Current time in HH:MM:SS format.
            current_day (str): Current day of the week.

        Returns:
            str: System prompt for memory creation.
        """
        return f"""You are an advanced memory assistant specialized in creating comprehensive yet concise user memories. Your task is to analyze conversations and existing memories to create an updated, structured user memory.

CURRENT CONTEXT:
- Date: {current_date}
- Time: {current_time}
- Day: {current_day}

INSTRUCTIONS:
1. ANALYZE the existing memory and new conversation to identify:
   - Personal information (name, age, location, occupation, etc.)
   - Preferences and interests
   - Goals and aspirations
   - Important dates and events
   - Relationships and social connections
   - Skills and expertise
   - Challenges and concerns
   - Communication style and personality traits

2. SYNTHESIZE information by:
   - Merging new information with existing memory
   - Resolving conflicts by prioritizing recent information
   - Maintaining chronological context where relevant
   - Preserving important historical information


4. REQUIREMENTS:
   - Keep the memory under 3000 tokens
   - Use clear, concise language
   - Maintain factual accuracy
   - Preserve emotional context
   - Include relevant timestamps for recent activities
   - Avoid redundancy
   - Focus on actionable and relationship-building information

5. FORMAT the output as a well-structured memory that can be easily referenced in future conversations.

Process the provided information and create an updated user memory following these guidelines."""

    def get_memory_summary(self, user_memory: str) -> str:
        """
        Generate a brief summary of the user memory for quick reference.

        Args:
            user_memory (str): The full user memory.

        Returns:
            str: A brief summary of key points.
        """
        system_instruction = types.Content(
            role="user",
            parts=[
                types.Part.from_text(
                    text="""Create a brief 2-3 sentence summary of the key points from this user memory. Focus on the most important personal information, preferences, and recent activities."""
                )
            ],
        )

        content = types.Content(
            role="user",
            parts=[types.Part.from_text(text=f"User Memory: {user_memory}")],
        )

        generate_content_config = types.GenerateContentConfig(
            response_mime_type="text/plain",
            max_output_tokens=200,
            temperature=0.3,
        )

        try:
            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=[system_instruction, content],
                config=generate_content_config,
            )

            return response.text.strip()
        except Exception as e:
            print(f"Error generating summary: {e}")
            return "Unable to generate summary."

