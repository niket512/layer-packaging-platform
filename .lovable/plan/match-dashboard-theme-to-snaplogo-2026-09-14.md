# Match dashboard theme to Snaplogo

## Goal
Bring the dashboard into the same orange, white, and cool-gray visual system as the Snaplogo landing page without changing its layout or catalogue behavior.

## Changes
- Replace the dashboard-only paper and green colors with the landing page’s white background, orange primary actions, pale orange highlights, dark slate text, and cool-gray borders.
- Update image plates, selected states, navigation highlights, filters, badges, and the comparison tray so they feel consistent with the logo and landing page.
- Remove the remaining hardcoded green accent and green-tinted shadow from dashboard elements.
- Keep all catalogue content, filters, shortlist, compare, and sachet behavior unchanged.

## Validation
- Check the dashboard at desktop and the current narrow viewport.
- Confirm selected states, product cards, dialogs, and the comparison tray remain readable.
- Confirm the preview builds without errors.

## Technical details
Most changes will use the existing semantic color tokens in `src/index.css`; isolated hardcoded dashboard colors will be replaced with those tokens.
