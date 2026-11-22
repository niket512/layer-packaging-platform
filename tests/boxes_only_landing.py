import asyncio
from playwright.async_api import async_playwright


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        for query in ["", "?category=pouches", "?keyword=sachet+manufacturer"]:
            await page.goto(f"http://localhost:8080/{query}", wait_until="networkidle")
            form = page.get_by_role("form", name="Packaging requirement form").first
            await form.get_by_role("button", name="Shipping box", exact=True).click()
            await form.get_by_role("button", name="Continue", exact=True).click()
            await form.get_by_label("Initial quantity", exact=True).fill("2400 pieces")
            await form.get_by_role("button", name="Continue", exact=True).click()
            await form.get_by_role("button", name="Kraft", exact=True).click()
            await form.get_by_role("button", name="Logo only", exact=True).click()
            await form.get_by_role("button", name="Review brief", exact=True).click()
            assert "Shipping box" in await form.inner_text()
            assert "2400 pieces" in await form.inner_text()
            assert "pouches" not in (await page.locator("main").inner_text()).lower()
            assert "sachets" not in (await page.locator("main").inner_text()).lower()
        await page.goto("http://localhost:8080/sourcing/flexible-pouches", wait_until="networkidle")
        assert await page.get_by_role("button", name="Stand-up pouch", exact=True).count() == 1
        await browser.close()


asyncio.run(main())