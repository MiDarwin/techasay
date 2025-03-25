import jwt
from datetime import datetime, timedelta
from config import SECRET_KEY, ALGORITHM

def create_access_token(data: dict, expires_delta: timedelta = timedelta(hours=250)):
    """JWT token oluşturma."""
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    """JWT token doğrulama."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None  # Token süresi dolmuş
    except jwt.InvalidTokenError:
        return None  # Geçersiz token

def get_user_id_from_token(token: str):
    """Token'den user_id'yi çıkar."""
    payload = verify_token(token)
    if not payload or "user_id" not in payload:
        return None
    return payload["user_id"]
