# Faraid Web App

A simple web application for calculating common Islamic inheritance (Faraid) scenarios based on authentic Qur'an and Sunnah principles.

## Features

- Calculate estate value after debts, funeral costs, and bequests
- Support common heirs: husband, wife, father, mother, sons, and daughters
- Display share fractions and amounts in AED
- Simple, clean interface that works in the browser without a build step

## Important disclaimer

This app is designed for common faraid scenarios and educational use. In complex inheritance matters, especially with multiple heirs, special family circumstances, or disputed claims, a qualified Islamic scholar or local legal advisor should verify the result.

## Run locally

From the project folder:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Project structure

- `index.html` — app layout
- `styles.css` — styling
- `app.js` — calculation logic and UI behavior

## Notes

This is a first-version app focused on common family inheritance calculations and is not a substitute for a full legal ruling in every case.
