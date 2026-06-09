from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response, UploadFile, File, Query, Header
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.responses import Response as FastResponse
import os
import logging
import uuid
import bcrypt
import jwt
import requests
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional


# ---------- Config ----------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"
ADMIN_EMAIL = os.environ['ADMIN_EMAIL'].lower()
ADMIN_PASSWORD = os.environ['ADMIN_PASSWORD']
WHATSAPP_NUMBER = os.environ.get('WHATSAPP_NUMBER', '918796306375')
APP_NAME = os.environ.get('APP_NAME', 'delhi-ncr-events')

EMERGENT_KEY = os.environ.get('EMERGENT_LLM_KEY')
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
storage_key = None

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------- Storage helpers ----------
def init_storage():
    global storage_key
    if storage_key:
        return storage_key
    try:
        resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
        resp.raise_for_status()
        storage_key = resp.json()["storage_key"]
        return storage_key
    except Exception as e:
        logger.error(f"Storage init failed: {e}")
        return None

def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    if not key:
        raise HTTPException(status_code=500, detail="Storage not available")
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120
    )
    if resp.status_code == 403:
        global storage_key
        storage_key = None
        key = init_storage()
        resp = requests.put(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": key, "Content-Type": content_type},
            data=data, timeout=120
        )
    resp.raise_for_status()
    return resp.json()

def get_object(path: str):
    key = init_storage()
    if not key:
        raise HTTPException(status_code=500, detail="Storage not available")
    resp = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key}, timeout=60
    )
    if resp.status_code == 403:
        global storage_key
        storage_key = None
        key = init_storage()
        resp = requests.get(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": key}, timeout=60
        )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


# ---------- Auth helpers ----------
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
    availability_status: str = "Available"  # Available | Limited Availability | Fully Booked | Coming Soon
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


# ---------- App ----------
app = FastAPI()
api_router = APIRouter(prefix="/api")


# ---------- Public Routes ----------
@api_router.get("/")
async def root():
    return {"message": "Delhi NCR Event Planner API"}

@api_router.get("/settings")
async def get_settings():
    settings = await db.settings.find_one({"id": "global"}, {"_id": 0})
    if not settings:
        settings = {
            "id": "global",
            "company_name": "Delhi NCR Event Planner",
            "tagline": "Crafting Unforgettable Moments",
            "phone": "+91 87963 06375",
            "whatsapp": WHATSAPP_NUMBER,
            "email": "contact@delhincrevents.com",
            "address": "Delhi NCR, India",
            "instagram": "https://instagram.com/",
            "facebook": "https://facebook.com/",
            "youtube": "https://youtube.com/",
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
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user["id"], email)
    response.set_cookie(
        key="access_token", value=token, httponly=True,
        secure=False, samesite="lax", max_age=604800, path="/"
    )
    return {"id": user["id"], "email": email, "name": user.get("name", "Admin"), "token": token}

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie(key="access_token", path="/")
    return {"success": True}

@api_router.get("/auth/me")
async def me(user=Depends(get_current_admin)):
    return user


# ---------- Admin: Packages ----------
@api_router.get("/admin/packages")
async def admin_list_packages(_=Depends(get_current_admin)):
    items = await db.packages.find({}, {"_id": 0}).sort("display_order", 1).to_list(1000)
    return items

@api_router.post("/admin/packages")
async def admin_create_package(payload: PackageIn, _=Depends(get_current_admin)):
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    doc["updated_at"] = doc["created_at"]
    await db.packages.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.put("/admin/packages/{package_id}")
async def admin_update_package(package_id: str, payload: PackageIn, _=Depends(get_current_admin)):
    update = payload.model_dump()
    update["updated_at"] = datetime.now(timezone.utc).isoformat()
    res = await db.packages.update_one({"id": package_id}, {"$set": update})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    pkg = await db.packages.find_one({"id": package_id}, {"_id": 0})
    return pkg

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
    pkg["package_name"] = pkg["package_name"] + " (Copy)"
    pkg["created_at"] = datetime.now(timezone.utc).isoformat()
    pkg["updated_at"] = pkg["created_at"]
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
    items = await db.leads.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return items

@api_router.put("/admin/leads/{lead_id}/status")
async def admin_update_lead_status(lead_id: str, payload: LeadStatusUpdate, _=Depends(get_current_admin)):
    res = await db.leads.update_one(
        {"id": lead_id},
        {"$set": {"status": payload.status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"success": True}

@api_router.delete("/admin/leads/{lead_id}")
async def admin_delete_lead(lead_id: str, _=Depends(get_current_admin)):
    await db.leads.delete_one({"id": lead_id})
    return {"success": True}


# ---------- Admin: Testimonials ----------
@api_router.get("/admin/testimonials")
async def admin_list_testimonials(_=Depends(get_current_admin)):
    items = await db.testimonials.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return items

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
    items = await db.gallery.find({}, {"_id": 0}).sort("display_order", 1).to_list(1000)
    return items

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


# ---------- Admin: Image Upload ----------
@api_router.post("/admin/upload")
async def upload_image(file: UploadFile = File(...), _=Depends(get_current_admin)):
    ext = file.filename.split(".")[-1].lower() if file.filename and "." in file.filename else "jpg"
    if ext not in ["jpg", "jpeg", "png", "webp", "gif"]:
        raise HTTPException(status_code=400, detail="Unsupported image type")
    path = f"{APP_NAME}/uploads/{uuid.uuid4()}.{ext}"
    data = await file.read()
    content_type = file.content_type or f"image/{ext}"
    result = put_object(path, data, content_type)
    await db.files.insert_one({
        "id": str(uuid.uuid4()),
        "storage_path": result["path"],
        "original_filename": file.filename,
        "content_type": content_type,
        "size": result.get("size", len(data)),
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    return {"path": result["path"], "url": f"/api/files/{result['path']}"}


# Public file serve - images are public for marketing site
@api_router.get("/files/{path:path}")
async def serve_file(path: str):
    record = await db.files.find_one({"storage_path": path, "is_deleted": False})
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    data, content_type = get_object(path)
    return FastResponse(content=data, media_type=record.get("content_type", content_type))


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

    # leads per category
    category_pipeline = [{"$group": {"_id": "$event_type", "count": {"$sum": 1}}}]
    cat_data = await db.leads.aggregate(category_pipeline).to_list(50)
    leads_per_category = [{"category": x["_id"], "count": x["count"]} for x in cat_data]

    # leads per month (last 6 months)
    leads_per_month = []
    for i in range(5, -1, -1):
        d = (now.replace(day=1) - timedelta(days=i*30))
        ms = d.replace(day=1).date().isoformat()
        next_month = (d.replace(day=28) + timedelta(days=4)).replace(day=1).date().isoformat()
        count = await db.leads.count_documents({"created_at": {"$gte": ms, "$lt": next_month}})
        leads_per_month.append({"month": d.strftime("%b %Y"), "count": count})

    return {
        "total_leads": total_leads,
        "today_leads": today_leads,
        "month_leads": month_leads,
        "total_packages": total_packages,
        "total_gallery": total_gallery,
        "total_testimonials": total_testimonials,
        "conversion_rate": conversion_rate,
        "leads_per_category": leads_per_category,
        "leads_per_month": leads_per_month,
    }


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Startup ----------
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

    categories = [
        ("Wedding", "https://images.pexels.com/photos/34079355/pexels-photo-34079355.jpeg"),
        ("Birthday", "https://images.unsplash.com/photo-1741969494307-55394e3e4071?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNzl8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwYmlydGhkYXklMjBwYXJ0eSUyMGRlY29yYXRpb25zfGVufDB8fHx8MTc4MTAwMDEzMnww&ixlib=rb-4.1.0&q=85"),
        ("Anniversary", "https://images.unsplash.com/photo-1756190564669-215843660e93?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTB8MHwxfHNlYXJjaHwzfHxsdXh1cnklMjBpbmRpYW4lMjB3ZWRkaW5nJTIwZGVjb3J8ZW58MHx8fHwxNzgxMDAwMTMyfDA&ixlib=rb-4.1.0&q=85"),
        ("Baby Shower", "https://images.pexels.com/photos/1682462/pexels-photo-1682462.jpeg"),
        ("Corporate", "https://images.pexels.com/photos/26202153/pexels-photo-26202153.jpeg"),
        ("Engagement", "https://images.unsplash.com/photo-1618566864264-fb013f791da4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwyfHxlbmdhZ2VtZW50JTIwcmluZyUyMGNlcmVtb255JTIwY291cGxlfGVufDB8fHx8MTc4MTAwMDEzOXww&ixlib=rb-4.1.0&q=85"),
        ("Housewarming", "https://images.unsplash.com/photo-1649083048770-82e8ffd80431?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNzl8MHwxfHNlYXJjaHwxfHxiZWF1dGlmdWwlMjBob21lJTIwaW50ZXJpb3J8ZW58MHx8fHwxNzgxMDAwMTMyfDA&ixlib=rb-4.1.0&q=85"),
    ]

    tiers = [
        ("Essential", 75000, 65000, [
            "Venue Decoration", "Standard Floral Arrangements",
            "Sound System", "Event Coordinator", "Basic Photography"
        ]),
        ("Premium", 175000, 159000, [
            "Premium Venue Decoration", "Designer Floral Setup", "DJ & Live Music Coordination",
            "Professional Photography & Video", "Dedicated Event Manager", "Custom Theme Setup",
            "Welcome Drinks"
        ]),
        ("Bespoke", 450000, None, [
            "Bespoke Venue Transformation", "Luxury Floral Installations", "Celebrity Performers Coordination",
            "Cinematic Photography & Drone", "Full Concierge Service", "Custom Stage & Lighting",
            "Premium Catering", "Hospitality Suites", "Welcome Hampers"
        ]),
    ]

    order = 0
    pkgs = []
    for cat, img in categories:
        for tname, price, discount, services in tiers:
            order += 1
            pkgs.append({
                "id": str(uuid.uuid4()),
                "package_name": f"{cat} {tname}",
                "event_category": cat,
                "cover_image": img,
                "gallery_images": [img],
                "price": price,
                "discount_price": discount,
                "description": f"{tname} {cat} package designed for an unforgettable celebration with premium services across Delhi NCR.",
                "services": services,
                "availability_status": "Available" if tname != "Bespoke" else "Limited Availability",
                "featured": tname == "Premium",
                "visible": True,
                "display_order": order,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat(),
            })
    await db.packages.insert_many(pkgs)

    # Seed testimonials
    testimonials = [
        {"id": str(uuid.uuid4()), "name": "Priya & Rohan Sharma", "rating": 5, "event_type": "Wedding",
         "review": "Absolutely magical experience! The team transformed our venue into a fairytale. Every detail was thought of — from floral arrangements to lighting. Highly recommended.",
         "image": "https://images.unsplash.com/photo-1580489944761-15a19d654956?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MDZ8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMHNtaWxpbmd8ZW58MHx8fHwxNzgxMDAwMTMyfDA&ixlib=rb-4.1.0&q=85",
         "visible": True, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Aakash Mehta", "rating": 5, "event_type": "Corporate",
         "review": "Our annual gala was a stunning success. Professional, punctual, and creative. The Delhi NCR Event Planner team exceeded our expectations.",
         "image": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MDZ8MHwxfHNlYXJjaHwyfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMHNtaWxpbmd8ZW58MHx8fHwxNzgxMDAwMTMyfDA&ixlib=rb-4.1.0&q=85",
         "visible": True, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Neha Kapoor", "rating": 5, "event_type": "Baby Shower",
         "review": "The most beautiful baby shower I could have asked for! Soft pastel theme, gorgeous setup, and excellent coordination. Thank you team!",
         "image": "https://images.pexels.com/photos/29086752/pexels-photo-29086752.jpeg",
         "visible": True, "created_at": datetime.now(timezone.utc).isoformat()},
    ]
    await db.testimonials.insert_many(testimonials)

    # Seed gallery
    gallery_seeds = [
        ("Wedding", "https://images.pexels.com/photos/34079355/pexels-photo-34079355.jpeg"),
        ("Wedding", "https://images.unsplash.com/photo-1729237261091-bae8eba0c60c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTB8MHwxfHNlYXJjaHw0fHxsdXh1cnklMjBpbmRpYW4lMjB3ZWRkaW5nJTIwZGVjb3J8ZW58MHx8fHwxNzgxMDAwMTMyfDA&ixlib=rb-4.1.0&q=85"),
        ("Birthday", "https://images.unsplash.com/photo-1741969494307-55394e3e4071?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNzl8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwYmlydGhkYXklMjBwYXJ0eSUyMGRlY29yYXRpb25zfGVufDB8fHx8MTc4MTAwMDEzMnww&ixlib=rb-4.1.0&q=85"),
        ("Corporate", "https://images.pexels.com/photos/26202153/pexels-photo-26202153.jpeg"),
        ("Anniversary", "https://images.unsplash.com/photo-1756190564669-215843660e93?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTB8MHwxfHNlYXJjaHwzfHxsdXh1cnklMjBpbmRpYW4lMjB3ZWRkaW5nJTIwZGVjb3J8ZW58MHx8fHwxNzgxMDAwMTMyfDA&ixlib=rb-4.1.0&q=85"),
        ("Baby Shower", "https://images.pexels.com/photos/1682462/pexels-photo-1682462.jpeg"),
        ("Engagement", "https://images.unsplash.com/photo-1618566864264-fb013f791da4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwyfHxlbmdhZ2VtZW50JTIwcmluZyUyMGNlcmVtb255JTIwY291cGxlfGVufDB8fHx8MTc4MTAwMDEzOXww&ixlib=rb-4.1.0&q=85"),
        ("Housewarming", "https://images.unsplash.com/photo-1649083048770-82e8ffd80431?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNzl8MHwxfHNlYXJjaHwxfHxiZWF1dGlmdWwlMjBob21lJTIwaW50ZXJpb3J8ZW58MHx8fHwxNzgxMDAwMTMyfDA&ixlib=rb-4.1.0&q=85"),
        ("Wedding", "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzF8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBldmVudCUyMHZlbnVlJTIwaGFsbHxlbnwwfHx8fDE3ODEwMDAxMzl8MA&ixlib=rb-4.1.0&q=85"),
    ]
    gdocs = []
    for i, (cat, img) in enumerate(gallery_seeds):
        gdocs.append({
            "id": str(uuid.uuid4()),
            "image": img,
            "category": cat,
            "title": f"{cat} Highlights",
            "display_order": i,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    await db.gallery.insert_many(gdocs)
    logger.info("Demo data seeded")


@app.on_event("startup")
async def startup_event():
    await seed_admin()
    await seed_demo_data()
    try:
        init_storage()
        logger.info("Storage initialized")
    except Exception as e:
        logger.warning(f"Storage init at startup deferred: {e}")


@app.on_event("shutdown")
async def shutdown_event():
    client.close()
