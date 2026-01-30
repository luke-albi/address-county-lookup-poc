// Backend proxy version - no API key in frontend
// Uses Vercel serverless functions to proxy Google APIs

const PROXY_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000/api'  // Local Vercel dev server
  : '/api';  // Production Vercel serverless functions

let autocompleteTimeout;
let selectedPlaceId = null;

function initAutocomplete() {
  const input = document.getElementById('address-input');
  const dropdown = createAutocompleteDropdown();

  input.addEventListener('input', handleInput);
  input.addEventListener('blur', () => {
    // Delay hiding to allow click events
    setTimeout(() => hideDropdown(dropdown), 200);
  });

  // Initialize geocoder reference (not used, but keeps structure similar)
  window.geocoder = { proxy: true };
}

function createAutocompleteDropdown() {
  const dropdown = document.createElement('div');
  dropdown.id = 'autocomplete-dropdown';
  dropdown.className = 'autocomplete-dropdown';
  document.querySelector('.input-group').appendChild(dropdown);
  return dropdown;
}

function handleInput(event) {
  const input = event.target.value.trim();
  const dropdown = document.getElementById('autocomplete-dropdown');

  if (input.length < 3) {
    hideDropdown(dropdown);
    return;
  }

  // Debounce API calls
  clearTimeout(autocompleteTimeout);
  autocompleteTimeout = setTimeout(() => {
    fetchAutocompleteSuggestions(input, dropdown);
  }, 300);
}

async function fetchAutocompleteSuggestions(input, dropdown) {
  try {
    const response = await fetch(`${PROXY_BASE_URL}/autocomplete?input=${encodeURIComponent(input)}`);
    const data = await response.json();

    if (data.status === 'OK' && data.predictions && data.predictions.length > 0) {
      displaySuggestions(data.predictions, dropdown);
    } else {
      hideDropdown(dropdown);
    }
  } catch (error) {
    console.error('Autocomplete error:', error);
    showError('Failed to fetch address suggestions');
  }
}

function displaySuggestions(predictions, dropdown) {
  dropdown.innerHTML = '';

  predictions.forEach(prediction => {
    const item = document.createElement('div');
    item.className = 'autocomplete-item';
    item.textContent = prediction.description;
    item.dataset.placeId = prediction.place_id;

    item.addEventListener('click', () => {
      document.getElementById('address-input').value = prediction.description;
      selectedPlaceId = prediction.place_id;
      hideDropdown(dropdown);
      onPlaceSelected(prediction.place_id);
    });

    dropdown.appendChild(item);
  });

  dropdown.classList.add('show');
}

function hideDropdown(dropdown) {
  dropdown.classList.remove('show');
}

async function onPlaceSelected(placeId) {
  showLoading(true);
  hideError();
  hideResult();

  try {
    // Get place details to get coordinates
    const detailsResponse = await fetch(`${PROXY_BASE_URL}/place-details?place_id=${placeId}`);
    const detailsData = await detailsResponse.json();

    if (detailsData.status === 'OK' && detailsData.result && detailsData.result.geometry) {
      const location = detailsData.result.geometry.location;
      await getCountyInfo(location);
    } else {
      showError('Unable to get location details');
      showLoading(false);
    }
  } catch (error) {
    console.error('Place details error:', error);
    showError('Failed to get place details');
    showLoading(false);
  }
}

async function getCountyInfo(location) {
  try {
    // Use Geocoder proxy to get detailed address components including county
    const response = await fetch(`${PROXY_BASE_URL}/geocode?lat=${location.lat}&lng=${location.lng}`);
    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results[0]) {
      const addressComponents = data.results[0].address_components;
      const countyInfo = extractCountyInfo(addressComponents);

      if (countyInfo.county) {
        displayResult(countyInfo, data.results[0].formatted_address);
      } else {
        showError('County information not available for this address');
      }
    } else {
      showError('Unable to retrieve county information');
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    showError('Failed to get county information');
  }

  showLoading(false);
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

// Add CSS for custom dropdown
const style = document.createElement('style');
style.textContent = `
  .autocomplete-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 2px solid #e0e0e0;
    border-top: none;
    border-radius: 0 0 10px 10px;
    max-height: 300px;
    overflow-y: auto;
    display: none;
    z-index: 1000;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    margin-top: -10px;
  }

  .autocomplete-dropdown.show {
    display: block;
  }

  .autocomplete-item {
    padding: 12px 16px;
    cursor: pointer;
    border-bottom: 1px solid #f5f5f5;
    transition: background 0.2s;
  }

  .autocomplete-item:hover {
    background-color: #f5f5f5;
  }

  .autocomplete-item:last-child {
    border-bottom: none;
  }

  .input-group {
    position: relative;
  }
`;
document.head.appendChild(style);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAutocomplete);
} else {
  initAutocomplete();
}

// Make function globally available for compatibility
window.initAutocomplete = initAutocomplete;
