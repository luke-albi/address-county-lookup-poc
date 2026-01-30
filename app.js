let autocomplete;
let geocoder;

function initAutocomplete() {
    const input = document.getElementById('address-input');

    // Initialize autocomplete
    autocomplete = new google.maps.places.Autocomplete(input, {
        types: ['address'],
        componentRestrictions: { country: 'us' }
    });

    // Initialize geocoder for reverse geocoding
    geocoder = new google.maps.Geocoder();

    // Listen for place selection
    autocomplete.addListener('place_changed', onPlaceChanged);
}

function onPlaceChanged() {
    const place = autocomplete.getPlace();

    if (!place.geometry) {
        showError('No details available for this address');
        return;
    }

    showLoading(true);
    hideError();
    hideResult();

    // Get county information
    getCountyInfo(place);
}

function getCountyInfo(place) {
    const location = place.geometry.location;

    // Use Geocoder to get detailed address components including county
    geocoder.geocode({ location: location }, (results, status) => {
        if (status === 'OK' && results[0]) {
            const addressComponents = results[0].address_components;
            const countyInfo = extractCountyInfo(addressComponents);

            if (countyInfo.county) {
                displayResult(countyInfo, results[0].formatted_address);
            } else {
                showError('County information not available for this address');
            }
        } else {
            showError('Unable to retrieve county information');
        }

        showLoading(false);
    });
}

function extractCountyInfo(components) {
    const info = {
        county: null,
        city: null,
        state: null,
        stateShort: null,
        zip: null
    };

    components.forEach(component => {
        const types = component.types;

        if (types.includes('administrative_area_level_2')) {
            info.county = component.long_name;
        }
        if (types.includes('locality')) {
            info.city = component.long_name;
        }
        if (types.includes('administrative_area_level_1')) {
            info.state = component.long_name;
            info.stateShort = component.short_name;
        }
        if (types.includes('postal_code')) {
            info.zip = component.long_name;
        }
    });

    return info;
}

function displayResult(countyInfo, fullAddress) {
    document.getElementById('county-name').textContent = countyInfo.county || '—';
    document.getElementById('full-address').textContent = fullAddress || '—';
    document.getElementById('city').textContent = countyInfo.city || '—';
    document.getElementById('state').textContent =
        `${countyInfo.state || '—'}${countyInfo.stateShort ? ' (' + countyInfo.stateShort + ')' : ''}`;
    document.getElementById('zip').textContent = countyInfo.zip || '—';

    document.getElementById('result-card').classList.add('show');
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
}

function hideError() {
    document.getElementById('error').classList.remove('show');
}

function hideResult() {
    document.getElementById('result-card').classList.remove('show');
}

function showLoading(show) {
    if (show) {
        document.getElementById('loading').classList.add('show');
    } else {
        document.getElementById('loading').classList.remove('show');
    }
}

// Make function globally available for callback
window.initAutocomplete = initAutocomplete;
