from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any # Ensure Any is imported

from ahp import calculate_ahp_weights
from moora import calculate_moora_ranking

app = FastAPI()

# Configure CORS to allow requests from your Next.js frontend
origins = [
    "http://localhost",
    "http://localhost:3000", # Your Next.js frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic model for AHP pairwise comparison matrix input
class AHPCalculateRequest(BaseModel):
    matrix: List[List[float]]
    criteria: List[str] # Accept criteria from frontend

# Pydantic model for AHP calculation response
class AHPCalculateResponse(BaseModel):
    weights: List[float]
    cr: float
    is_consistent: bool
    message: str
    criteria: List[str] # Include criteria names in the response

# Pydantic model for Restaurant data
class RestaurantBase(BaseModel):
    name: str
    harga: int
    rasa: float
    kebersihan: float
    kenyamanan: float
    pelayanan: float
    fasilitas: float
    popularitas: float

class RestaurantCreate(RestaurantBase):
    pass

class Restaurant(RestaurantBase):
    id: str # Unique identifier for the restaurant

# Pydantic model for MOORA ranking request
class MOORARankRequest(BaseModel):
    ahp_weights: List[float]
    restaurants: List[Restaurant]
    criterion_types: Dict[str, str] = None
    criteria: List[str] = None

# Pydantic model for MOORA ranking response (including rank and score)
class RankedRestaurant(Restaurant):
    score: float
    rank: int

# In-memory storage for restaurants
restaurants_db: Dict[str, Restaurant] = {}
next_restaurant_id: int = 1

@app.get("/")
async def read_root():
    return {"message": "Welcome to the DSS Backend!"}

@app.get("/api/hello")
async def hello():
    return {"message": "Hello from FastAPI!"}

@app.post("/ahp/calculate", response_model=AHPCalculateResponse)
async def calculate_ahp(request: AHPCalculateRequest):
    try:
        result = calculate_ahp_weights(request.matrix)
        return AHPCalculateResponse(
            weights=result["weights"],
            cr=result["cr"],
            is_consistent=result["is_consistent"],
            message=result["message"],
            criteria=request.criteria # Use criteria from request
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

# Restaurant CRUD Endpoints
@app.post("/restaurants", response_model=Restaurant)
async def create_restaurant(restaurant: RestaurantCreate):
    global next_restaurant_id
    restaurant_id = str(next_restaurant_id)
    new_restaurant = Restaurant(id=restaurant_id, **restaurant.dict())
    restaurants_db[restaurant_id] = new_restaurant
    next_restaurant_id += 1
    return new_restaurant

@app.get("/restaurants", response_model=List[Restaurant])
async def get_all_restaurants():
    return list(restaurants_db.values())

@app.get("/restaurants/{restaurant_id}", response_model=Restaurant)
async def get_restaurant(restaurant_id: str):
    if restaurant_id not in restaurants_db:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return restaurants_db[restaurant_id]

@app.put("/restaurants/{restaurant_id}", response_model=Restaurant)
async def update_restaurant(restaurant_id: str, restaurant: RestaurantCreate):
    if restaurant_id not in restaurants_db:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    updated_restaurant = Restaurant(id=restaurant_id, **restaurant.dict())
    restaurants_db[restaurant_id] = updated_restaurant
    return updated_restaurant

@app.delete("/restaurants/{restaurant_id}", status_code=204)
async def delete_restaurant(restaurant_id: str):
    if restaurant_id not in restaurants_db:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    del restaurants_db[restaurant_id]
    return {"message": "Restaurant deleted successfully"}

# MOORA Ranking Endpoint
@app.post("/moora/rank", response_model=List[RankedRestaurant])
async def rank_restaurants(request: MOORARankRequest):
    try:
        ranked_results = calculate_moora_ranking(
            [r.dict() for r in request.restaurants],
            request.ahp_weights,
            request.criterion_types,
            request.criteria
        )
        return [RankedRestaurant(**r) for r in ranked_results]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred during MOORA ranking: {str(e)}")




# Anda akan menambahkan endpoint AHP, MOORA, dan CRUD restoran di sini