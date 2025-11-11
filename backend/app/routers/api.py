from fastapi import APIRouter, HTTPException
from app.services.ollama import ask_ollama

router = APIRouter(prefix="/example", tags=["Example"])


@router.get("/")
def get_example():
    return {"message": "This is an example endpoint."}


@router.get("/llm")
def query_ollama(prompt: str = "Why is the sky blue?"):
    messages = [{"role": "user", "content": prompt}]
    try:
        response = ask_ollama("gpt-oss:120b", messages)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{item_id}")
def get_item(item_id: int):
    return {"item_id": item_id, "description": f"Item number {item_id}"}
