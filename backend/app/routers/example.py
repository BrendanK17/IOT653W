from fastapi import APIRouter

router = APIRouter(
    prefix="/example",
    tags=["Example"]
)

@router.get("/")
def get_example():
    return {"message": "This is an example endpoint."}

@router.get("/{item_id}")
def get_item(item_id: int):
    return {"item_id": item_id, "description": f"Item number {item_id}"}
