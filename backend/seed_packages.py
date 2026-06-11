import asyncio
import os
import uuid
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()

async def seed_haldi_mehndi_packages():
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    # Delete existing Haldi and Mehndi packages if any
    await db.packages.delete_many({"event_category": {"$in": ["Haldi", "Mehndi"]}})
    
    # Haldi Packages
    haldi_packages = [
        {
            "id": str(uuid.uuid4()),
            "package_name": "Haldi Essential",
            "event_category": "Haldi",
            "cover_image": "https://res.cloudinary.com/dqk9kk7pj/image/upload/v1/decodiaries/haldi-essential.jpg",
            "gallery_images": [],
            "price": 25000,
            "discount_price": 19999,
            "description": "Traditional haldi ceremony setup with marigold flowers, turmeric paste station, and vibrant yellow decor.",
            "services": [
                "Marigold Flower Decor",
                "Turmeric Paste Station Setup",
                "Yellow Themed Backdrop",
                "Traditional Music System",
                "Event Coordinator"
            ],
            "availability_status": "Available",
            "featured": False,
            "visible": True,
            "display_order": 1,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "package_name": "Haldi Premium",
            "event_category": "Haldi",
            "cover_image": "https://res.cloudinary.com/dqk9kk7pj/image/upload/v1/decodiaries/haldi-premium.jpg",
            "gallery_images": [],
            "price": 55000,
            "discount_price": 44999,
            "description": "Premium haldi ceremony with elaborate floral arrangements, traditional folk music, and professional photography.",
            "services": [
                "Premium Marigold & Rose Decor",
                "Custom Haldi Setup with Seating",
                "Live Folk Music",
                "Professional Photography",
                "Welcome Drinks for Guests",
                "Dedicated Event Manager"
            ],
            "availability_status": "Available",
            "featured": True,
            "visible": True,
            "display_order": 2,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "package_name": "Haldi Bespoke",
            "event_category": "Haldi",
            "cover_image": "https://res.cloudinary.com/dqk9kk7pj/image/upload/v1/decodiaries/haldi-bespoke.jpg",
            "gallery_images": [],
            "price": 125000,
            "discount_price": None,
            "description": "Luxury haldi celebration with custom theme design, celebrity artist booking, and complete event management.",
            "services": [
                "Bespoke Theme Design",
                "Celebrity Artist Booking",
                "Full Event Production",
                "Cinematic Photography",
                "Gourmet Catering",
                "Guest Hospitality",
                "Complete Coordination"
            ],
            "availability_status": "Limited Availability",
            "featured": False,
            "visible": True,
            "display_order": 3,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    # Mehndi Packages
    mehndi_packages = [
        {
            "id": str(uuid.uuid4()),
            "package_name": "Mehndi Essential",
            "event_category": "Mehndi",
            "cover_image": "https://res.cloudinary.com/dqk9kk7pj/image/upload/v1/decodiaries/mehndi-essential.jpg",
            "gallery_images": [],
            "price": 35000,
            "discount_price": 29999,
            "description": "Beautiful mehndi ceremony setup with floral decor, mehndi artist arrangement, and vibrant ambiance.",
            "services": [
                "Floral Backdrop & Decor",
                "Mehndi Artist Arrangement",
                "Seating Arrangement",
                "Sound System",
                "Event Coordinator"
            ],
            "availability_status": "Available",
            "featured": False,
            "visible": True,
            "display_order": 4,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "package_name": "Mehndi Premium",
            "event_category": "Mehndi",
            "cover_image": "https://res.cloudinary.com/dqk9kk7pj/image/upload/v1/decodiaries/mehndi-premium.jpg",
            "gallery_images": [],
            "price": 75000,
            "discount_price": 64999,
            "description": "Premium mehndi night with elaborate lighting, multiple mehndi artists, and professional photography.",
            "services": [
                "Premium Floral & Lighting Decor",
                "3+ Mehndi Artists",
                "Live DJ Music",
                "Professional Photography & Video",
                "Welcome Drinks & Snacks",
                "Dedicated Event Manager"
            ],
            "availability_status": "Available",
            "featured": True,
            "visible": True,
            "display_order": 5,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "package_name": "Mehndi Bespoke",
            "event_category": "Mehndi",
            "cover_image": "https://res.cloudinary.com/dqk9kk7pj/image/upload/v1/decodiaries/mehndi-bespoke.jpg",
            "gallery_images": [],
            "price": 150000,
            "discount_price": None,
            "description": "Luxury mehndi celebration with custom theme, celebrity performers, and complete event production.",
            "services": [
                "Custom Themed Setup",
                "Celebrity Performer",
                "10+ Mehndi Artists",
                "Cinematic Photography & Drone",
                "Gourmet Food Stations",
                "Full Concierge Service"
            ],
            "availability_status": "Limited Availability",
            "featured": False,
            "visible": True,
            "display_order": 6,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    # Insert packages
    result1 = await db.packages.insert_many(haldi_packages)
    result2 = await db.packages.insert_many(mehndi_packages)
    
    print(f"✅ Added {len(result1.inserted_ids)} Haldi packages")
    print(f"✅ Added {len(result2.inserted_ids)} Mehndi packages")
    
    # Also update gallery categories
    await db.gallery.update_many(
        {"category": {"$in": ["Wedding", "Engagement", "Housewarming"]}},
        {"$set": {"visible": False}}
    )
    print("✅ Hidden old gallery categories")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_haldi_mehndi_packages())
