from pydantic import BaseModel
from datetime import date


class Expense(BaseModel):
    id: int
    date: date
    category: str
    amount: float
    description: str


class ExpenseRequest(BaseModel):
    date: date
    category: str
    amount: float
    description: str
