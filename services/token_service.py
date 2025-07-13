import os

from jose import jwt
from jose.exceptions import JWTError as InvalidTokenError


class TokenService:
    def __init__(self):
        self.secret_key = os.getenv(
            "JWT_SECRET_KEY",
        )

    def verify_token(self, token):
        """
        Verifies a JWT token using the secret key.

        Args:
            token (str): The JWT token to verify.

        Returns:
            dict: The decoded payload if the token is valid.

        Raises:
            InvalidTokenError: If the token is invalid or verification fails.
        """
        try:
            # Decode the token using the secret key
            payload = jwt.decode(
                token, self.secret_key, audience="authenticated", algorithms=["HS256"]
            )
            return payload
        except InvalidTokenError as e:
            # Raise an error if the token is invalid
            raise InvalidTokenError(f"Invalid token: {e}")
