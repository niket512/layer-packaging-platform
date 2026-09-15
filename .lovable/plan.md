# Add Elham and Star bottle catalogues

## What will change
- Import the valid HDPE edible-oil bottle and jar products from both uploaded catalogues
- Extract their embedded product photos and create lightweight grid thumbnails
- Map their names, capacities, shapes, and available specifications into the current catalogue format
- Add Elham MultiPlast LLP and Star Bottles to Manufacturing profiles with the standard custom mould, custom colour, and printing/labelling capabilities

## Checks
- Confirm the new products appear under Bottles & jars, work with search and filters, and open in the existing detail drawer
- Confirm both manufacturer profiles appear correctly on desktop and mobile
- Confirm the app builds without errors

## Technical details
- Preserve the existing catalogue schema and image paths
- Exclude entries that are not explicitly HDPE or do not have a usable product image
- Generate WebP thumbnails for fast catalogue scrolling while retaining full-size detail images
