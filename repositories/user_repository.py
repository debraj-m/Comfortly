import os

from supabase import Client, create_client


class UserRepository:
    def __init__(
        self,
    ):
        """
        Initialize the UserRepository with Supabase client.

        Args:
            supabase_url (str): The Supabase project URL.
            supabase_key (str): The Supabase API key.
        """
        supabase_url = os.getenv(
            "SUPABASE_URL",
        )
        supabase_key = os.getenv(
            "SUPABASE_KEY",
        )
        self.supabase: Client = create_client(supabase_url, supabase_key)

    def get_user_info(self, userId: str):
        """
        Fetch user information from the 'users' table.

        Args:
            userId (str): The ID of the user to fetch.

        Returns:
            dict: The user information if found, otherwise None.
        """
        response = (
            self.supabase.table("users").select("*").eq("id", userId).single().execute()
        )
        if response.data:
            return response.data
        return None

    def update_user_context(self, userId: str, updatedContext: str):
        """
        Update the user's context in the 'users' table.

        Args:
            userId (str): The ID of the user to update.
            updatedContext (str): The updated context to set for the user.

        Returns:
            dict: The updated user information if successful, otherwise None.
        """
        response = (
            self.supabase.table("users")
            .update({"context": updatedContext})
            .eq("id", userId)
            .execute()
        )
        if response.data:
            return response.data[0]
        return None
