import os
from playwright.sync_api import sync_playwright

print("Testing Playwright launch...")
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    page.goto("http://localhost:3000")
    page.wait_for_load_state("networkidle")
    os.makedirs("scratch_test", exist_ok=True)
    page.screenshot(path="scratch_test/landing_test.png")
    print("Screenshot saved to scratch_test/landing_test.png successfully!")
    browser.close()
