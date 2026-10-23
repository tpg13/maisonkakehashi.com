# Maison Kakehashi Property Map Directory

Define each property within its own subfolder here in `map/` (or `src/map/`).

The application automatically discovers and renders every property on the interactive map!

## How to add a new property:

1. Create a new folder, e.g. `src/map/my-new-house/`
2. Add a `property.json` file inside that folder with this structure:

```json
{
  "id": "my-new-house",
  "title": "Mt. Fuji Serenity House",
  "japaneseTitle": "富士吉田 庭園付邸宅",
  "price": "¥14,500,000",
  "priceEur": "€92,000",
  "location": "Fujiyoshida, Yamanashi",
  "region": "Chubu / Yamanashi",
  "coordinates": [138.7953, 35.4867],
  "type": "Kominka / Detached",
  "status": "Available",
  "landArea": "450 m²",
  "floorArea": "130 m²",
  "yearBuilt": "1986",
  "features": [
    "Garden View",
    "Parking Available",
    "Recently Inspected"
  ],
  "description": "Short description of the property, renovation details, and surrounding area."
}
```

> **Note on coordinates**: Provide `[longitude, latitude]` (e.g. Tokyo is `[139.6917, 35.6895]`, Kōfu is `[138.5683, 35.6639]`).

3. Place an image in the folder (e.g. `photo.jpg`, `photo.png`, or `photo.webp`).
   Any image file in the subfolder will be automatically matched to the property!

## Mapbox Token (Optional)
If you have a Mapbox Access Token, you can add it to your `.env` or `.env.local` file:
```env
VITE_MAPBOX_ACCESS_TOKEN=pk.your_mapbox_token_here
```
If no token is provided, the map automatically falls back to high-resolution dark cartographic tiles matching the site's cedar & gold aesthetic.
