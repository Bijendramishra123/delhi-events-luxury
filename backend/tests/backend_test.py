"""
End-to-end backend API tests for Delhi NCR Event Planner.
Covers: public endpoints (packages/gallery/testimonials/leads/settings),
auth, admin packages/leads/testimonials/gallery CRUD, upload + serve, analytics.
"""
import io
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://delhi-events-luxury.preview.emergentagent.com").rstrip("/")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "at307580@gmail.com")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "Mahi@123")
WHATSAPP_NUMBER = os.environ.get("WHATSAPP_NUMBER", "918796306375")


@pytest.fixture(scope="session")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(api):
    r = api.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if r.status_code != 200:
        pytest.skip(f"Admin login failed: {r.status_code} {r.text}")
    data = r.json()
    assert "token" in data
    return data["token"]


@pytest.fixture(scope="session")
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


# ---------- Public ----------
class TestPublic:
    def test_root(self, api):
        r = api.get(f"{BASE_URL}/api/")
        assert r.status_code == 200
        assert "Delhi NCR Event Planner" in r.json().get("message", "")

    def test_settings(self, api):
        r = api.get(f"{BASE_URL}/api/settings")
        assert r.status_code == 200
        data = r.json()
        assert data.get("whatsapp") == WHATSAPP_NUMBER

    def test_packages_all(self, api):
        r = api.get(f"{BASE_URL}/api/packages")
        assert r.status_code == 200
        pkgs = r.json()
        assert isinstance(pkgs, list)
        # 21 seeded (7 categories x 3 tiers). At least 21, may grow with admin tests
        assert len(pkgs) >= 21, f"Expected >=21 packages, got {len(pkgs)}"
        cats = {p["event_category"] for p in pkgs}
        assert {"Wedding", "Birthday", "Anniversary", "Baby Shower", "Corporate", "Engagement", "Housewarming"}.issubset(cats)

    def test_packages_filter_category(self, api):
        r = api.get(f"{BASE_URL}/api/packages", params={"category": "Wedding"})
        assert r.status_code == 200
        pkgs = r.json()
        assert len(pkgs) >= 3
        assert all(p["event_category"] == "Wedding" for p in pkgs)

    def test_package_by_id(self, api):
        all_pkgs = api.get(f"{BASE_URL}/api/packages").json()
        pid = all_pkgs[0]["id"]
        r = api.get(f"{BASE_URL}/api/packages/{pid}")
        assert r.status_code == 200
        assert r.json()["id"] == pid

    def test_package_not_found(self, api):
        r = api.get(f"{BASE_URL}/api/packages/nonexistent-id-xyz")
        assert r.status_code == 404

    def test_gallery_all(self, api):
        r = api.get(f"{BASE_URL}/api/gallery")
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        assert len(items) >= 9

    def test_gallery_filter(self, api):
        r = api.get(f"{BASE_URL}/api/gallery", params={"category": "Wedding"})
        assert r.status_code == 200
        items = r.json()
        assert all(i["category"] == "Wedding" for i in items)

    def test_testimonials(self, api):
        r = api.get(f"{BASE_URL}/api/testimonials")
        assert r.status_code == 200
        items = r.json()
        assert len(items) >= 3
        for t in items:
            assert t.get("visible") is True

    def test_create_lead(self, api):
        payload = {
            "name": "TEST_Lead User",
            "phone": "9999999999",
            "email": "test_lead@example.com",
            "event_type": "Wedding",
            "event_date": "2026-05-01",
            "location": "Delhi",
            "budget": "1L-2L",
            "message": "Need details",
        }
        r = api.post(f"{BASE_URL}/api/leads", json=payload)
        assert r.status_code == 200
        data = r.json()
        assert data["success"] is True
        assert "id" in data


# ---------- Auth ----------
class TestAuth:
    def test_login_success(self, api):
        r = api.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        data = r.json()
        assert data["email"] == ADMIN_EMAIL.lower()
        assert isinstance(data["token"], str) and len(data["token"]) > 20
        # cookie set
        assert "access_token" in r.cookies

    def test_login_invalid(self, api):
        r = api.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": "wrongpass"})
        assert r.status_code == 401

    def test_me_with_bearer(self, api, auth_headers):
        r = api.get(f"{BASE_URL}/api/auth/me", headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["email"] == ADMIN_EMAIL.lower()

    def test_admin_requires_auth(self, api):
        # ensure no cookie
        bare = requests.Session()
        r = bare.get(f"{BASE_URL}/api/admin/packages")
        assert r.status_code == 401


# ---------- Admin Packages CRUD ----------
class TestAdminPackages:
    def test_list(self, api, auth_headers):
        r = api.get(f"{BASE_URL}/api/admin/packages", headers=auth_headers)
        assert r.status_code == 200
        assert len(r.json()) >= 21

    def test_crud_flow(self, api, auth_headers):
        payload = {
            "package_name": "TEST_Package",
            "event_category": "Wedding",
            "cover_image": "",
            "gallery_images": [],
            "price": 100000,
            "description": "test",
            "services": ["A", "B"],
            "availability_status": "Available",
            "featured": False,
            "visible": True,
            "display_order": 999,
        }
        # create
        r = api.post(f"{BASE_URL}/api/admin/packages", headers=auth_headers, json=payload)
        assert r.status_code == 200
        pkg = r.json()
        pid = pkg["id"]
        assert pkg["package_name"] == "TEST_Package"

        # update
        payload["package_name"] = "TEST_Package_Updated"
        payload["price"] = 200000
        r = api.put(f"{BASE_URL}/api/admin/packages/{pid}", headers=auth_headers, json=payload)
        assert r.status_code == 200
        assert r.json()["package_name"] == "TEST_Package_Updated"

        # verify persisted (public)
        r = api.get(f"{BASE_URL}/api/packages/{pid}")
        assert r.status_code == 200
        assert r.json()["price"] == 200000

        # duplicate
        r = api.post(f"{BASE_URL}/api/admin/packages/{pid}/duplicate", headers=auth_headers)
        assert r.status_code == 200
        dup = r.json()
        assert "(Copy)" in dup["package_name"]
        dup_id = dup["id"]

        # delete both
        for x in [pid, dup_id]:
            r = api.delete(f"{BASE_URL}/api/admin/packages/{x}", headers=auth_headers)
            assert r.status_code == 200
        # verify gone
        r = api.get(f"{BASE_URL}/api/packages/{pid}")
        assert r.status_code == 404


# ---------- Admin Leads ----------
class TestAdminLeads:
    def test_list_and_filter(self, api, auth_headers):
        # seed a lead
        api.post(f"{BASE_URL}/api/leads", json={
            "name": "TEST_Lead_Filter", "phone": "8888888888",
            "event_type": "Birthday"
        })
        r = api.get(f"{BASE_URL}/api/admin/leads", headers=auth_headers)
        assert r.status_code == 200
        leads = r.json()
        assert len(leads) >= 1

        # search
        r = api.get(f"{BASE_URL}/api/admin/leads", headers=auth_headers, params={"q": "TEST_Lead_Filter"})
        assert r.status_code == 200
        assert any("TEST_Lead_Filter" in x["name"] for x in r.json())

        # filter
        r = api.get(f"{BASE_URL}/api/admin/leads", headers=auth_headers, params={"status": "New"})
        assert r.status_code == 200
        assert all(x["status"] == "New" for x in r.json())

    def test_status_update_and_delete(self, api, auth_headers):
        # create lead
        c = api.post(f"{BASE_URL}/api/leads", json={
            "name": "TEST_Lead_Status", "phone": "7777777777", "event_type": "Wedding"
        })
        lid = c.json()["id"]
        r = api.put(f"{BASE_URL}/api/admin/leads/{lid}/status",
                    headers=auth_headers, json={"status": "Booked"})
        assert r.status_code == 200
        # verify
        leads = api.get(f"{BASE_URL}/api/admin/leads", headers=auth_headers,
                        params={"q": "TEST_Lead_Status"}).json()
        assert any(l["id"] == lid and l["status"] == "Booked" for l in leads)

        # delete
        r = api.delete(f"{BASE_URL}/api/admin/leads/{lid}", headers=auth_headers)
        assert r.status_code == 200


# ---------- Admin Testimonials ----------
class TestAdminTestimonials:
    def test_crud(self, api, auth_headers):
        payload = {"name": "TEST_T", "rating": 4, "review": "Great",
                   "event_type": "Wedding", "image": "", "visible": True}
        r = api.post(f"{BASE_URL}/api/admin/testimonials", headers=auth_headers, json=payload)
        assert r.status_code == 200
        tid = r.json()["id"]
        payload["review"] = "Updated review"
        r = api.put(f"{BASE_URL}/api/admin/testimonials/{tid}", headers=auth_headers, json=payload)
        assert r.status_code == 200
        assert r.json()["review"] == "Updated review"
        r = api.delete(f"{BASE_URL}/api/admin/testimonials/{tid}", headers=auth_headers)
        assert r.status_code == 200


# ---------- Admin Gallery ----------
class TestAdminGallery:
    def test_crud(self, api, auth_headers):
        r = api.get(f"{BASE_URL}/api/admin/gallery", headers=auth_headers)
        assert r.status_code == 200
        payload = {"image": "https://example.com/x.jpg", "category": "Wedding", "title": "TEST_G", "display_order": 99}
        r = api.post(f"{BASE_URL}/api/admin/gallery", headers=auth_headers, json=payload)
        assert r.status_code == 200
        gid = r.json()["id"]
        r = api.delete(f"{BASE_URL}/api/admin/gallery/{gid}", headers=auth_headers)
        assert r.status_code == 200


# ---------- Upload + Serve ----------
class TestUpload:
    def test_upload_and_serve(self, admin_token):
        # 1x1 PNG
        png = bytes.fromhex("89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000A49444154789C6300010000000500010D0A2DB40000000049454E44AE426082")
        files = {"file": ("test.png", io.BytesIO(png), "image/png")}
        r = requests.post(f"{BASE_URL}/api/admin/upload",
                          headers={"Authorization": f"Bearer {admin_token}"},
                          files=files, timeout=120)
        assert r.status_code == 200, f"Upload failed: {r.text}"
        data = r.json()
        assert "path" in data and "url" in data
        # serve
        r = requests.get(f"{BASE_URL}{data['url']}", timeout=60)
        assert r.status_code == 200
        assert r.content == png


# ---------- Analytics ----------
class TestAnalytics:
    def test_analytics(self, api, auth_headers):
        r = api.get(f"{BASE_URL}/api/admin/analytics", headers=auth_headers)
        assert r.status_code == 200
        d = r.json()
        for key in ["total_leads", "today_leads", "month_leads", "total_packages",
                    "total_gallery", "total_testimonials", "conversion_rate",
                    "leads_per_category", "leads_per_month"]:
            assert key in d
        assert isinstance(d["leads_per_category"], list)
        assert isinstance(d["leads_per_month"], list)
