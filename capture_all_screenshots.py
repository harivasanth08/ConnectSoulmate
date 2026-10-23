import os
import json
import time
import requests
from playwright.sync_api import sync_playwright

API_URL = "http://localhost:5000"
FRONTEND_URL = "http://localhost:3000"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(BASE_DIR, "screenshots")

# Create target directories
dirs = [
    f"{OUTPUT_DIR}/public",
    f"{OUTPUT_DIR}/user",
    f"{OUTPUT_DIR}/parent",
    f"{OUTPUT_DIR}/admin",
    f"{OUTPUT_DIR}/themes",
    f"{OUTPUT_DIR}/responsive"
]
for d in dirs:
    os.makedirs(d, exist_ok=True)

# Login Helper
def get_auth_data(email, password):
    resp = requests.post(f"{API_URL}/api/auth/login", json={"email": email, "password": password})
    if resp.status_code == 200:
        data = resp.json()
        if data.get("success"):
            return data.get("token"), data.get("user")
    print(f"Failed to log in as {email}: {resp.text}")
    return None, None

# Load credentials from environment variables (do not hardcode in source)
USER_EMAIL = os.environ.get("SCREENSHOT_USER_EMAIL")
USER_PASSWORD = os.environ.get("SCREENSHOT_USER_PASSWORD")
PARENT_EMAIL = os.environ.get("SCREENSHOT_PARENT_EMAIL")
PARENT_PASSWORD = os.environ.get("SCREENSHOT_PARENT_PASSWORD")
ADMIN_EMAIL = os.environ.get("SCREENSHOT_ADMIN_EMAIL")
ADMIN_PASSWORD = os.environ.get("SCREENSHOT_ADMIN_PASSWORD")

missing_vars = []
if not USER_EMAIL: missing_vars.append("SCREENSHOT_USER_EMAIL")
if not USER_PASSWORD: missing_vars.append("SCREENSHOT_USER_PASSWORD")
if not PARENT_EMAIL: missing_vars.append("SCREENSHOT_PARENT_EMAIL")
if not PARENT_PASSWORD: missing_vars.append("SCREENSHOT_PARENT_PASSWORD")
if not ADMIN_EMAIL: missing_vars.append("SCREENSHOT_ADMIN_EMAIL")
if not ADMIN_PASSWORD: missing_vars.append("SCREENSHOT_ADMIN_PASSWORD")

if missing_vars:
    print(f"Error: Missing required environment variable(s) for screenshot automation: {', '.join(missing_vars)}")
    print("Please set these environment variables locally before running capture_all_screenshots.py.")
    exit(1)

user_token, user_data = get_auth_data(USER_EMAIL, USER_PASSWORD)
parent_token, parent_data = get_auth_data(PARENT_EMAIL, PARENT_PASSWORD)
admin_token, admin_data = get_auth_data(ADMIN_EMAIL, ADMIN_PASSWORD)

print(f"Auth Loaded -> User: {bool(user_token)}, Parent: {bool(parent_token)}, Admin: {bool(admin_token)}")

def set_auth_and_theme(page, token=None, user=None, theme="dark"):
    page.goto(FRONTEND_URL)
    page.evaluate(f"""
        (args) => {{
            if (args.theme) {{
                localStorage.setItem('connectsoulmate-theme', args.theme);
                if (args.theme === 'light') {{
                    document.documentElement.classList.add('theme-light');
                }} else {{
                    document.documentElement.classList.remove('theme-light');
                }}
            }}
            if (args.token) {{
                localStorage.setItem('connectsoulmate_token', args.token);
                localStorage.setItem('connectsoulmate_user', JSON.stringify(args.user));
            }} else {{
                localStorage.removeItem('connectsoulmate_token');
                localStorage.removeItem('connectsoulmate_user');
            }}
        }}
    """, {"token": token, "user": user, "theme": theme})

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)

    # 1. Desktop Screenshots (1440x900)
    desktop_context = browser.new_context(viewport={"width": 1440, "height": 900})
    page = desktop_context.new_page()

    # --- PUBLIC PAGES ---
    public_routes = [
        ("001_Public_Landing_Page.png", f"{OUTPUT_DIR}/public/001_Public_Landing_Page.png", "/"),
        ("002_Public_Register_Page.png", f"{OUTPUT_DIR}/public/002_Public_Register_Page.png", "/register"),
        ("003_Public_Login_Page.png", f"{OUTPUT_DIR}/public/003_Public_Login_Page.png", "/login"),
        ("004_Public_Email_Verification.png", f"{OUTPUT_DIR}/public/004_Public_Email_Verification.png", "/verify-email"),
        ("005_Public_Mobile_Verification.png", f"{OUTPUT_DIR}/public/005_Public_Mobile_Verification.png", "/verify-mobile"),
        ("006_Public_Onboarding_Preview.png", f"{OUTPUT_DIR}/public/006_Public_Onboarding_Preview.png", "/onboarding"),
        ("007_Public_Contact_Us.png", f"{OUTPUT_DIR}/public/007_Public_Contact_Us.png", "/contact"),
        ("008_Public_Terms_and_Conditions.png", f"{OUTPUT_DIR}/public/008_Public_Terms_and_Conditions.png", "/terms"),
        ("009_Public_Privacy_Policy.png", f"{OUTPUT_DIR}/public/009_Public_Privacy_Policy.png", "/privacy"),
        ("010_Public_Support_Center.png", f"{OUTPUT_DIR}/public/010_Public_Support_Center.png", "/support"),
        ("011_Public_Wedding_Services.png", f"{OUTPUT_DIR}/public/011_Public_Wedding_Services.png", "/services"),
        ("012_Public_Service_Category.png", f"{OUTPUT_DIR}/public/012_Public_Service_Category.png", "/services/wedding-planner"),
    ]

    for name, path, route in public_routes:
        set_auth_and_theme(page, token=None, user=None, theme="dark")
        page.goto(f"{FRONTEND_URL}{route}")
        page.wait_for_timeout(1000)
        page.screenshot(path=path, full_page=True)
        print(f"Captured: {name}")

    # --- USER PAGES ---
    user_routes = [
        ("013_User_Dashboard.png", f"{OUTPUT_DIR}/user/013_User_Dashboard.png", "/dashboard"),
        ("014_User_Profile_Edit.png", f"{OUTPUT_DIR}/user/014_User_Profile_Edit.png", "/profile"),
        ("015_User_Profile_View.png", f"{OUTPUT_DIR}/user/015_User_Profile_View.png", "/profile/33"),
        ("016_User_Match_Search.png", f"{OUTPUT_DIR}/user/016_User_Match_Search.png", "/search"),
        ("017_User_Received_Interests.png", f"{OUTPUT_DIR}/user/017_User_Received_Interests.png", "/interests"),
        ("018_User_Saved_Shortlist.png", f"{OUTPUT_DIR}/user/018_User_Saved_Shortlist.png", "/shortlist"),
        ("019_User_Messages_Chat.png", f"{OUTPUT_DIR}/user/019_User_Messages_Chat.png", "/messages"),
        ("020_User_Notifications.png", f"{OUTPUT_DIR}/user/020_User_Notifications.png", "/notifications"),
        ("021_User_Membership_Subscription.png", f"{OUTPUT_DIR}/user/021_User_Membership_Subscription.png", "/subscription"),
        ("022_User_AI_Kundali_Matching.png", f"{OUTPUT_DIR}/user/022_User_AI_Kundali_Matching.png", "/kundali"),
    ]

    for name, path, route in user_routes:
        set_auth_and_theme(page, token=user_token, user=user_data, theme="dark")
        page.goto(f"{FRONTEND_URL}{route}")
        page.wait_for_timeout(1200)
        page.screenshot(path=path, full_page=True)
        print(f"Captured: {name}")

    # --- PARENT MODE PAGES ---
    parent_routes = [
        ("023_Parent_Login.png", f"{OUTPUT_DIR}/parent/023_Parent_Login.png", "/parent/login"),
        ("024_Parent_Register.png", f"{OUTPUT_DIR}/parent/024_Parent_Register.png", "/parent/register"),
        ("025_Parent_Onboarding.png", f"{OUTPUT_DIR}/parent/025_Parent_Onboarding.png", "/parent/onboarding"),
        ("026_Parent_Dashboard.png", f"{OUTPUT_DIR}/parent/026_Parent_Dashboard.png", "/parent/dashboard"),
        ("027_Parent_Search.png", f"{OUTPUT_DIR}/parent/027_Parent_Search.png", "/parent/search"),
        ("028_Parent_Interests.png", f"{OUTPUT_DIR}/parent/028_Parent_Interests.png", "/parent/interests"),
        ("029_Parent_Shortlist.png", f"{OUTPUT_DIR}/parent/029_Parent_Shortlist.png", "/parent/shortlist"),
        ("030_Parent_Messages.png", f"{OUTPUT_DIR}/parent/030_Parent_Messages.png", "/parent/messages"),
    ]

    for name, path, route in parent_routes:
        set_auth_and_theme(page, token=parent_token, user=parent_data, theme="dark")
        page.goto(f"{FRONTEND_URL}{route}")
        page.wait_for_timeout(1200)
        page.screenshot(path=path, full_page=True)
        print(f"Captured: {name}")

    # --- ADMIN PAGES ---
    admin_routes = [
        ("031_Admin_Dashboard.png", f"{OUTPUT_DIR}/admin/031_Admin_Dashboard.png", "/admin/dashboard"),
        ("032_Admin_User_Management.png", f"{OUTPUT_DIR}/admin/032_Admin_User_Management.png", "/admin/users"),
        ("033_Admin_User_Detail.png", f"{OUTPUT_DIR}/admin/033_Admin_User_Detail.png", "/admin/users/31"),
        ("034_Admin_Subscriptions.png", f"{OUTPUT_DIR}/admin/034_Admin_Subscriptions.png", "/admin/subscriptions"),
        ("035_Admin_Payments.png", f"{OUTPUT_DIR}/admin/035_Admin_Payments.png", "/admin/payments"),
        ("036_Admin_Activity.png", f"{OUTPUT_DIR}/admin/036_Admin_Activity.png", "/admin/activity"),
        ("037_Admin_Audit_Logs.png", f"{OUTPUT_DIR}/admin/037_Admin_Audit_Logs.png", "/admin/audit-logs"),
        ("038_Admin_System_Health.png", f"{OUTPUT_DIR}/admin/038_Admin_System_Health.png", "/admin/health"),
    ]

    for name, path, route in admin_routes:
        set_auth_and_theme(page, token=admin_token, user=admin_data, theme="dark")
        page.goto(f"{FRONTEND_URL}{route}")
        page.wait_for_timeout(1200)
        page.screenshot(path=path, full_page=True)
        print(f"Captured: {name}")

    # --- THEMES COMPARISON (LIGHT & DARK) ---
    theme_routes = [
        ("039_Theme_Landing_Light.png", f"{OUTPUT_DIR}/themes/039_Theme_Landing_Light.png", "/", None, None, "light"),
        ("040_Theme_Landing_Dark.png", f"{OUTPUT_DIR}/themes/040_Theme_Landing_Dark.png", "/", None, None, "dark"),
        ("041_Theme_Dashboard_Light.png", f"{OUTPUT_DIR}/themes/041_Theme_Dashboard_Light.png", "/dashboard", user_token, user_data, "light"),
        ("042_Theme_Dashboard_Dark.png", f"{OUTPUT_DIR}/themes/042_Theme_Dashboard_Dark.png", "/dashboard", user_token, user_data, "dark"),
        ("043_Theme_Search_Light.png", f"{OUTPUT_DIR}/themes/043_Theme_Search_Light.png", "/search", user_token, user_data, "light"),
        ("044_Theme_Search_Dark.png", f"{OUTPUT_DIR}/themes/044_Theme_Search_Dark.png", "/search", user_token, user_data, "dark"),
        ("045_Theme_Kundali_Light.png", f"{OUTPUT_DIR}/themes/045_Theme_Kundali_Light.png", "/kundali", user_token, user_data, "light"),
        ("046_Theme_Kundali_Dark.png", f"{OUTPUT_DIR}/themes/046_Theme_Kundali_Dark.png", "/kundali", user_token, user_data, "dark"),
    ]

    for name, path, route, token, user, theme in theme_routes:
        set_auth_and_theme(page, token=token, user=user, theme=theme)
        page.goto(f"{FRONTEND_URL}{route}")
        page.wait_for_timeout(1200)
        page.screenshot(path=path, full_page=True)
        print(f"Captured: {name}")

    desktop_context.close()

    # 2. Responsive Mobile Context (390x844)
    mobile_context = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True)
    m_page = mobile_context.new_page()

    mobile_routes = [
        ("047_Mobile_Landing_Page.png", f"{OUTPUT_DIR}/responsive/047_Mobile_Landing_Page.png", "/", None, None),
        ("048_Mobile_Register_Page.png", f"{OUTPUT_DIR}/responsive/048_Mobile_Register_Page.png", "/register", None, None),
        ("049_Mobile_Login_Page.png", f"{OUTPUT_DIR}/responsive/049_Mobile_Login_Page.png", "/login", None, None),
        ("050_Mobile_Dashboard.png", f"{OUTPUT_DIR}/responsive/050_Mobile_Dashboard.png", "/dashboard", user_token, user_data),
        ("051_Mobile_Search.png", f"{OUTPUT_DIR}/responsive/051_Mobile_Search.png", "/search", user_token, user_data),
        ("052_Mobile_Messages.png", f"{OUTPUT_DIR}/responsive/052_Mobile_Messages.png", "/messages", user_token, user_data),
        ("053_Mobile_Subscription.png", f"{OUTPUT_DIR}/responsive/053_Mobile_Subscription.png", "/subscription", user_token, user_data),
        ("054_Mobile_Admin_Dashboard.png", f"{OUTPUT_DIR}/responsive/054_Mobile_Admin_Dashboard.png", "/admin/dashboard", admin_token, admin_data),
    ]

    for name, path, route, token, user in mobile_routes:
        set_auth_and_theme(m_page, token=token, user=user, theme="dark")
        m_page.goto(f"{FRONTEND_URL}{route}")
        m_page.wait_for_timeout(1200)
        m_page.screenshot(path=path, full_page=True)
        print(f"Captured: {name}")

    mobile_context.close()
    browser.close()

print("\nAll 54 screenshots captured successfully!")
