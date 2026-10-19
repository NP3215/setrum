# Setrum

A mobile app UI prototype for monitoring home electricity: live power, usage by hour, month and year, per-device control, a bill estimator and alerts.

**This is a front-end design prototype.** There is no backend and no real meter. All usage numbers are generated in the browser from a seeded model, and the tariff rates and taxes are sample values, not an official bill.

## What it does

- **Home:** live power gauge against the contract capacity (VA), a live chart updated every second, and hourly, daily and monthly usage charts you can scrub with a finger or the mouse. Insight cards cover the top consumer, monthly budget and a carbon estimate.
- **Devices:** search, sort, switch devices on or off, and open a detail sheet with the day's usage and a saving tip.
- **Properties:** switch between places or add a new one.
- **Bill:** pick a month (or a projection for the current one), choose a tariff, see the breakdown and a donut chart by device, and download a summary.
- **Alerts:** filter, expand, mark as read, swipe to dismiss with undo, and check again for new alerts.
- **Profile:** light, dark or automatic theme, editable profile, monthly budget and notification preferences, saved in the browser only.

## Run it

Open `index.html` in a browser. On a computer it shows inside a phone frame; on a phone it fills the screen. No build step is needed.

## Stack

Plain HTML, CSS and JavaScript. Charts are hand-written SVG, with no chart library.

The old pages `bill-estimation.html`, `notification.html` and `profile.html` now just redirect to the matching tab in `index.html`.
