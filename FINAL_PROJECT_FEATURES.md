# Final-Year Project Upgrade

## Demonstrable workflow
1. Landing/Login
2. Role-based command center
3. Add vehicle + upload vehicle image
4. Add part + automatically generate unique QR identity
5. Download/display QR as a PNG data URL through `/api/qr/:partId`
6. Scan QR using camera
7. Identify part
8. View manual and CAD reference
9. Record repair
10. Review digital service history
11. Track maintenance

## Admin CRUD
- Vehicle create/update/delete
- Part create/update/delete
- Manual upload
- CAD upload

## Actual 3D model support
The `RealCarModel.jsx` component loads a `.glb/.gltf` asset from `/public/models/`.
Add a legally usable model as:
`frontend/public/models/car.glb`

Then render:
`<RealCarModel src="/models/car.glb" />`

## Demo data
Tata Nexon, Hyundai Creta and Mahindra Thar are preloaded, together with brake, oil-filter, air-filter, suspension and battery components.
