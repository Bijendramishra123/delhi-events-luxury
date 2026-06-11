from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response, UploadFile, File
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import bcrypt
import jwt
import cloudinary
import cloudinary.uploader
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from contextlib import asynccontextmanager

# ---------- Cloudinary Config ----------
cloudinary.config(
    cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME', 'dqk9kk7pj'),
    api_key=os.environ.get('CLOUDINARY_API_KEY', '132465766871662'),
    api_secret=os.environ.get('CLOUDINARY_API_SECRET')
)

# ---------- MongoDB Config ----------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"
ADMIN_EMAIL = os.environ['ADMIN_EMAIL'].lower()
ADMIN_PASSWORD = os.environ['ADMIN_PASSWORD']
WHATSAPP_NUMBER = os.environ.get('WHATSAPP_NUMBER', '918796306375')
APP_NAME = os.environ.get('APP_NAME', 'delhi-ncr-events')

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------- Auth Helpers ----------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email,
               "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "access"}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_admin(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.admins.find_one({"id": payload["sub"]})
        if not user:
            raise HTTPException(status_code=401, detail="Admin not found")
        user.pop("password_hash", None)
        user.pop("_id", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ---------- Models ----------
class LoginIn(BaseModel):
    email: EmailStr
    password: str

class PackageIn(BaseModel):
    package_name: str
    event_category: str
    cover_image: Optional[str] = ""
    gallery_images: List[str] = []
    price: float = 0
    discount_price: Optional[float] = None
    description: str = ""
    services: List[str] = []
    availability_status: str = "Available"
    featured: bool = False
    visible: bool = True
    display_order: int = 0

class LeadIn(BaseModel):
    name: str
    phone: str
    email: Optional[str] = ""
    event_type: str
    event_date: Optional[str] = ""
    location: Optional[str] = ""
    budget: Optional[str] = ""
    message: Optional[str] = ""

class LeadStatusUpdate(BaseModel):
    status: str

class TestimonialIn(BaseModel):
    name: str
    rating: int = 5
    review: str
    event_type: str
    image: Optional[str] = ""
    visible: bool = True

class GalleryItemIn(BaseModel):
    image: str
    category: str
    title: Optional[str] = ""
    display_order: int = 0

# ---------- Seed Functions ----------
async def seed_admin():
    existing = await db.admins.find_one({"email": ADMIN_EMAIL})
    if existing is None:
        await db.admins.insert_one({
            "id": str(uuid.uuid4()),
            "email": ADMIN_EMAIL,
            "password_hash": hash_password(ADMIN_PASSWORD),
            "name": "Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info("Admin seeded")
    elif not verify_password(ADMIN_PASSWORD, existing["password_hash"]):
        await db.admins.update_one(
            {"email": ADMIN_EMAIL},
            {"$set": {"password_hash": hash_password(ADMIN_PASSWORD)}}
        )
        logger.info("Admin password updated")

async def seed_demo_data():
    if await db.packages.count_documents({}) > 0:
        return
    logger.info("Demo data ready")

# ---------- Lifespan ----------
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up...")
    await seed_admin()
    await seed_demo_data()
    yield
    logger.info("Shutting down...")
    client.close()

# ---------- App ----------
app = FastAPI(lifespan=lifespan)
api_router = APIRouter(prefix="/api")

# ---------- Public Routes ----------
@api_router.get("/")
async def root():
    return {"message": "Delhi Events API", "status": "healthy"}

@api_router.get("/settings")
async def get_settings():
    settings = await db.settings.find_one({"id": "global"}, {"_id": 0})
    if not settings:
        settings = {
            "id": "global",
            "company_name": "Decodiaries",
            "whatsapp": WHATSAPP_NUMBER,
            "email": "contact@decodiaries.com",
            "address": "Delhi NCR, India",
        }
    return settings

@api_router.get("/packages")
async def list_packages(category: Optional[str] = None, featured: Optional[bool] = None):
    query = {"visible": True}
    if category:
        query["event_category"] = category
    if featured is not None:
        query["featured"] = featured
    packages = await db.packages.find(query, {"_id": 0}).sort("display_order", 1).to_list(500)
    return packages

@api_router.get("/packages/{package_id}")
async def get_package(package_id: str):
    pkg = await db.packages.find_one({"id": package_id}, {"_id": 0})
    if not pkg:
        raise HTTPException(status_code=404, detail="Package not found")
    return pkg

@api_router.get("/gallery")
async def list_gallery(category: Optional[str] = None):
    query = {}
    if category and category != "all":
        query["category"] = category
    items = await db.gallery.find(query, {"_id": 0}).sort("display_order", 1).to_list(500)
    return items

@api_router.get("/testimonials")
async def list_testimonials():
    items = await db.testimonials.find({"visible": True}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return items

@api_router.post("/leads")
async def create_lead(lead: LeadIn):
    doc = lead.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["status"] = "New"
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    doc["updated_at"] = doc["created_at"]
    await db.leads.insert_one(doc)
    doc.pop("_id", None)
    return {"success": True, "id": doc["id"]}

# ---------- Auth Routes ----------
@api_router.post("/auth/login")
async def login(payload: LoginIn, response: Response):
    email = payload.email.lower()
    user = await db.admins.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(user["id"], email)
    response.set_cookie(key="access_token", value=token, httponly=True, secure=True, samesite="none", max_age=604800, path="/")
    return {"id": user["id"], "email": email, "name": user.get("name", "Admin")}

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie(key="access_token", path="/", secure=True, samesite="none")
    return {"success": True}

@api_router.get("/auth/me")
async def me(user=Depends(get_current_admin)):
    return user

# ---------- Admin: Packages ----------
@api_router.get("/admin/packages")
async def admin_list_packages(_=Depends(get_current_admin)):
    return await db.packages.find({}, {"_id": 0}).sort("display_order", 1).to_list(1000)

@api_router.post("/admin/packages")
async def admin_create_package(payload: PackageIn, _=Depends(get_current_admin)):
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = doc["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.packages.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.put("/admin/packages/{package_id}")
async def admin_update_package(package_id: str, payload: PackageIn, _=Depends(get_current_admin)):
    update = payload.model_dump()
    update["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.packages.update_one({"id": package_id}, {"$set": update})
    return await db.packages.find_one({"id": package_id}, {"_id": 0})

@api_router.delete("/admin/packages/{package_id}")
async def admin_delete_package(package_id: str, _=Depends(get_current_admin)):
    await db.packages.delete_one({"id": package_id})
    return {"success": True}

@api_router.post("/admin/packages/{package_id}/duplicate")
async def admin_duplicate_package(package_id: str, _=Depends(get_current_admin)):
    pkg = await db.packages.find_one({"id": package_id}, {"_id": 0})
    if not pkg:
        raise HTTPException(status_code=404, detail="Not found")
    pkg["id"] = str(uuid.uuid4())
    pkg["package_name"] += " (Copy)"
    pkg["created_at"] = pkg["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.packages.insert_one(pkg)
    pkg.pop("_id", None)
    return pkg

# ---------- Admin: Leads ----------
@api_router.get("/admin/leads")
async def admin_list_leads(status: Optional[str] = None, q: Optional[str] = None, _=Depends(get_current_admin)):
    query = {}
    if status:
        query["status"] = status
    if q:
        query["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"phone": {"$regex": q, "$options": "i"}},
            {"email": {"$regex": q, "$options": "i"}},
            {"event_type": {"$regex": q, "$options": "i"}},
        ]
    return await db.leads.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)

@api_router.put("/admin/leads/{lead_id}/status")
async def admin_update_lead_status(lead_id: str, payload: LeadStatusUpdate, _=Depends(get_current_admin)):
    await db.leads.update_one({"id": lead_id}, {"$set": {"status": payload.status, "updated_at": datetime.now(timezone.utc).isoformat()}})
    return {"success": True}

@api_router.delete("/admin/leads/{lead_id}")
async def admin_delete_lead(lead_id: str, _=Depends(get_current_admin)):
    await db.leads.delete_one({"id": lead_id})
    return {"success": True}

# ---------- Admin: Testimonials ----------
@api_router.get("/admin/testimonials")
async def admin_list_testimonials(_=Depends(get_current_admin)):
    return await db.testimonials.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)

@api_router.post("/admin/testimonials")
async def admin_create_testimonial(payload: TestimonialIn, _=Depends(get_current_admin)):
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.testimonials.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.put("/admin/testimonials/{tid}")
async def admin_update_testimonial(tid: str, payload: TestimonialIn, _=Depends(get_current_admin)):
    await db.testimonials.update_one({"id": tid}, {"$set": payload.model_dump()})
    return await db.testimonials.find_one({"id": tid}, {"_id": 0})

@api_router.delete("/admin/testimonials/{tid}")
async def admin_delete_testimonial(tid: str, _=Depends(get_current_admin)):
    await db.testimonials.delete_one({"id": tid})
    return {"success": True}

# ---------- Admin: Gallery ----------
@api_router.get("/admin/gallery")
async def admin_list_gallery(_=Depends(get_current_admin)):
    return await db.gallery.find({}, {"_id": 0}).sort("display_order", 1).to_list(1000)

@api_router.post("/admin/gallery")
async def admin_create_gallery(payload: GalleryItemIn, _=Depends(get_current_admin)):
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.gallery.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.delete("/admin/gallery/{gid}")
async def admin_delete_gallery(gid: str, _=Depends(get_current_admin)):
    await db.gallery.delete_one({"id": gid})
    return {"success": True}

# ---------- Admin: Image Upload with Cloudiary ----------
@api_router.post("/admin/upload")
async def upload_image(file: UploadFile = File(...), _=Depends(get_current_admin)):
    try:
        ext = file.filename.split(".")[-1].lower()
        if ext not in ["jpg", "jpeg", "png", "webp", "gif"]:
            raise HTTPException(status_code=400, detail="Unsupported image type")
        
        contents = await file.read()
        upload_result = cloudinary.uploader.upload(
            contents,
            folder=f"{APP_NAME}/uploads",
            allowed_formats=["jpg", "jpeg", "png", "webp", "gif"],
            transformation=[{"quality": "auto", "fetch_format": "auto"}]
        )
        
        image_url = upload_result.get("secure_url")
        
        await db.files.insert_one({
            "id": str(uuid.uuid4()),
            "url": image_url,
            "original_filename": file.filename,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        logger.info(f"Image uploaded to Cloudinary: {image_url}")
        return {"path": image_url, "url": image_url}
        
    except Exception as e:
        logger.error(f"Upload failed: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

# ---------- Admin: Analytics ----------
@api_router.get("/admin/analytics")
async def admin_analytics(_=Depends(get_current_admin)):
    now = datetime.now(timezone.utc)
    today = now.date().isoformat()
    month_start = now.replace(day=1).date().isoformat()
    total_leads = await db.leads.count_documents({})
    today_leads = await db.leads.count_documents({"created_at": {"$gte": today}})
    month_leads = await db.leads.count_documents({"created_at": {"$gte": month_start}})
    total_packages = await db.packages.count_documents({})
    total_gallery = await db.gallery.count_documents({})
    total_testimonials = await db.testimonials.count_documents({})
    booked = await db.leads.count_documents({"status": "Booked"})
    conversion_rate = round((booked / total_leads * 100), 2) if total_leads else 0
    
    return {
        "total_leads": total_leads,
        "today_leads": today_leads,
        "month_leads": month_leads,
        "total_packages": total_packages,
        "total_gallery": total_gallery,
        "total_testimonials": total_testimonials,
        "conversion_rate": conversion_rate,
        "booked": booked,
        "leads_per_category": [],
        "leads_per_month": []
    }

app.include_router(api_router)

# ---------- CORS ----------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://delhi-events-luxury.vercel.app",
        "https://www.decodiaries.com",
        "https://decodiaries.com",
        "https://delhi-events-backend.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
)
