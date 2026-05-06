from pydantic import BaseModel
from typing import Generic, TypeVar, List

T = TypeVar("T")

class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    size: int
    pages: int

def paginate(query, page: int, size: int):
    """
    Helper function to paginate a SQLAlchemy query.
    Returns (items, total, pages)
    """
    total = query.count()
    pages = (total + size - 1) // size if size > 0 else 0
    items = query.offset((page - 1) * size).limit(size).all()
    return items, total, pages
