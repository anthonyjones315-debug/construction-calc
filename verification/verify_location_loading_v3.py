import time
import os
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        # Mock geolocation and a slow fetch response to capture the loading state
        context = browser.new_context(
            permissions=["geolocation"],
            geolocation={"latitude": 43.1, "longitude": -75.2},
        )

        # Route the Nominatim API to be slow
        context.route("https://nominatim.openstreetmap.org/reverse?**", lambda route: (
            time.sleep(3),
            route.fulfill(
                status=200,
                content_type="application/json",
                body='{"display_name": "123 Mock St, Mockville, NY"}'
            )
        ))

        page = context.new_page()

        # Wait for dev server
        for i in range(30):
            try:
                page.goto("http://localhost:3000/calculators/concrete/slab")
                break
            except Exception:
                time.sleep(2)

        # Click "Finalize & Send" to open the modal
        page.click("button:has-text('Finalize & Send')")

        # Click "Use Current Location"
        # We look for the button with aria-label="Use current location"
        location_btn = page.locator('button[aria-label="Use current location"]')
        location_btn.click()

        # Wait a moment for the spinner to appear
        time.sleep(0.5)

        # Take screenshot of the modal with the loading state
        os.makedirs("verification/screenshots", exist_ok=True)
        page.screenshot(path="verification/screenshots/loading_state_v3.png")
        print("Captured verification/screenshots/loading_state_v3.png")

        browser.close()

if __name__ == "__main__":
    run()
