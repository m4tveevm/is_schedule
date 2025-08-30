from typing import Optional
from ninja.security import HttpBearer
from rest_framework_simplejwt.authentication import JWTAuthentication


class SimpleJWTAuth(HttpBearer):
    def authenticate(self, request, token) -> Optional[object]:
        user_auth_tuple = JWTAuthentication().authenticate(request)
        if not user_auth_tuple:
            return None
        user, _ = user_auth_tuple
        return user
