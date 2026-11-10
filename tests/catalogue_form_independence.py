import asyncio
from pathlib import Path
from playwright.async_api import async_playwright
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True)
  for width in [393,320,1280]:
   page=await browser.new_page(viewport={'width':width,'height':1800 if width==1280 else 852})
   await page.goto('http://localhost:8080',wait_until='networkidle')
   main_form=page.get_by_role('form',name='Packaging requirement form').first
   await main_form.get_by_role('button',name='Shipping box',exact=True).click()
   await main_form.get_by_role('button',name='Continue',exact=True).click()
   await main_form.get_by_label('Initial quantity',exact=True).fill('7300 pieces')
   buttons=page.get_by_role('button',name='Select',exact=True)
   print('use buttons',width,await buttons.count())
   await buttons.first.click()
   dialog=page.get_by_role('dialog',name='Request quotes for selected design')
   await dialog.wait_for()
   await page.wait_for_timeout(350)
   await dialog.locator(":scope > div").evaluate("e => e.scrollTop = 0")
   await page.screenshot(path=f'/tmp/browser/mobile-catalogue/{width}-start.png')
   await dialog.get_by_label('Initial quantity',exact=True).fill('2200 pieces')
   await dialog.get_by_label('Delivery city',exact=True).fill('Pune')
   await dialog.get_by_label('WhatsApp number',exact=True).fill('')
   await dialog.get_by_role('combobox',name='Packaging style',exact=True).click()
   await page.get_by_role('option',name='Gift box',exact=True).click()
   print('style edited',await dialog.get_by_role('combobox',name='Packaging style',exact=True).inner_text())
   await dialog.get_by_label('WhatsApp number',exact=True).scroll_into_view_if_needed()
   await page.screenshot(path=f'/tmp/browser/mobile-catalogue/{width}-contact.png')
   print('overflow',await dialog.evaluate('(e)=>e.scrollWidth>e.clientWidth'))
   await dialog.get_by_role('button',name='Back to designs').click()
   assert await main_form.get_by_label('Initial quantity',exact=True).input_value() == '7300 pieces'
   assert await main_form.get_by_role('heading',name='Quantity & dimensions').count() == 1
   print('main form unchanged',width)
   await buttons.first.click()
   assert await dialog.get_by_label('Initial quantity',exact=True).input_value() == '2200 pieces'
   await page.close()
  await browser.close()
asyncio.run(main())
