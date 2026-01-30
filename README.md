# Address County Lookup POC

A proof-of-concept application that provides address autocomplete and returns the county information for any US address.

## Features

- **Address Autocomplete**: Real-time address suggestions as you type
- **County Lookup**: Automatically retrieves county information for selected address
- **Detailed Info**: Displays full address breakdown (street, city, state, zip, county)
- **Clean UI**: Modern, responsive interface

## Setup

### 1. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Places API
   - Geocoding API
4. Create credentials (API Key)
5. Restrict the API key to your domain (optional but recommended)

### 2. Configure API Key

Open `index.html` and replace `YOUR_API_KEY_HERE` with your actual API key:

```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_ACTUAL_API_KEY&libraries=places&callback=initAutocomplete" async defer></script>
```

### 3. Run the Application

#### Option 1: Simple HTTP Server (Python)
```bash
python3 -m http.server 8000
```
Then open: http://localhost:8000

#### Option 2: Node.js HTTP Server
```bash
npx http-server -p 8000
```
Then open: http://localhost:8000

#### Option 3: VS Code Live Server
- Install "Live Server" extension
- Right-click `index.html`
- Select "Open with Live Server"

## How It Works

1. **User Input**: User starts typing an address
2. **Autocomplete**: Google Places API provides address suggestions
3. **Selection**: User selects an address from dropdown
4. **Geocoding**: Application uses Geocoder to get detailed address components
5. **County Extract**: Extracts `administrative_area_level_2` (county) from results
6. **Display**: Shows county and full address breakdown

## API Components Used

### Google Places Autocomplete
- Provides real-time address suggestions
- Type: `address` (for street-level addresses)
- Restricted to: US addresses only

### Google Geocoding API
- Converts location to detailed address components
- Used to extract county information (not always available in Places API)

## Address Components Hierarchy

```
administrative_area_level_1 = State (e.g., "California", "CA")
administrative_area_level_2 = County (e.g., "Los Angeles County")
locality = City (e.g., "Los Angeles")
postal_code = Zip Code (e.g., "90210")
```

## Limitations

- **API Key Required**: Needs valid Google Maps API key
- **API Costs**: Google Maps API has usage limits and costs
- **US Only**: Currently restricted to US addresses
- **County Availability**: Some addresses may not return county information

## Alternative Approaches

### Free Alternatives (No API Key)

1. **Nominatim (OpenStreetMap)**
   - Free, no API key
   - Less accurate autocomplete
   - Rate limited

2. **Mapbox Geocoding**
   - Free tier available
   - Good autocomplete
   - Requires API key

3. **US Census Geocoder**
   - Free for US addresses
   - No autocomplete
   - Government-maintained

## Example Usage

1. Type: "1600 Amphitheatre"
2. Select: "1600 Amphitheatre Parkway, Mountain View, CA, USA"
3. Result: **Santa Clara County**

## File Structure

```
address-county-lookup-poc/
├── index.html          # Main HTML with UI and styles
├── app.js              # JavaScript logic for autocomplete and lookup
└── README.md           # This file
```

## Browser Compatibility

- Chrome: ✅
- Firefox: ✅
- Safari: ✅
- Edge: ✅

## Next Steps / Improvements

- [ ] Add support for international addresses
- [ ] Implement fallback to free geocoding APIs
- [ ] Add map visualization
- [ ] Cache results to reduce API calls
- [ ] Add ability to copy county name
- [ ] Implement dark mode
- [ ] Add loading states
- [ ] Error handling for API failures

## License

MIT - Free to use for any purpose
