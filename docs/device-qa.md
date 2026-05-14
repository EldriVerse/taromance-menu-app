# Device QA Baseline

## Store Tablet

- Device: Lenovo Xiaoxin Pad 2024 12.7 inch
- Native resolution: `2944 x 1840`
- Aspect ratio: `16:10`
- Landscape QA viewport: `2944 x 1840`
- Portrait QA viewport: `1840 x 2944`

## QA Rule

- Use the native resolution for visual QA when checking button position, scroll background alignment, category navigation, popup sizing, and touch hit areas.
- Do not rely on half-scale `1472 x 920` screenshots for final layout judgment, because button positions and fixed/clamped spacing can look different at native resolution.
