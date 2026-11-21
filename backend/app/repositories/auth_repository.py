from sqlalchemy import text
from sqlalchemy.orm import Session


def login_usuario(db: Session, username: str):
    query = text("SELECT * FROM login_usuario(:username)")
    result = db.execute(query, {"username": username}).mappings().first()
    return result

