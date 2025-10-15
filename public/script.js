const form = document.getElementById("weather-form");
const cityInput = document.getElementById("city-input");
const resultDiv = document.getElementById("result");
const loadingDiv = document.getElementById("loading");
const cityName = document.getElementById("city-name");
const temp = document.getElementById("temp");
const conditions = document.getElementById("conditions");
const source = document.getElementById("source");
const weatherIcon = document.getElementById("weather-icon");
const errorBox = document.getElementById("error");
const errorMessage = document.getElementById("error-message");
const submitBtn = document.getElementById("submit-btn");
const forecastContainer = document.getElementById("forecast-container");
const forecastDays = document.getElementById("forecast-days");
const feelsLike = document.getElementById("feels-like");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");

// Mode switching elements
const optionBtns = document.querySelectorAll(".option-btn");
const mapContainer = document.getElementById("map-container");
const mapConfirmBtn = document.getElementById("map-confirm-btn");

let map = null;
let marker = null;
let selectedLocation = null;

// Map weather conditions to emojis
function getWeatherIcon(conditionText) {
  const condition = conditionText.toLowerCase();
  if (condition.includes("clear") || condition.includes("sunny")) return "☀️";
  if (condition.includes("cloud")) return "☁️";
  if (condition.includes("rain") || condition.includes("drizzle")) return "🌧️";
  if (condition.includes("snow")) return "❄️";
  if (condition.includes("thunder") || condition.includes("storm")) return "⛈️";
  if (condition.includes("fog") || condition.includes("mist")) return "🌫️";
  if (condition.includes("wind")) return "💨";
  if (condition.includes("overcast")) return "☁️";
  if (condition.includes("partly")) return "⛅";
  return "🌤️";
}

// Get temperature color class
function getTempColorClass(tempC) {
  if (tempC === null || tempC === undefined) return "";
  if (tempC >= 30) return "temp-hot";
  if (tempC >= 20) return "temp-warm";
  if (tempC >= 10) return "temp-mild";
  if (tempC >= 0) return "temp-cool";
  return "temp-cold";
}

// Format date for forecast
function formatDate(dateString) {
  const date = new Date(dateString);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
}

// Initialize map
function initMap() {
  if (!map) {
    map = L.map("map").setView([20, 0], 2);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    map.on("click", function (e) {
      if (marker) {
        map.removeLayer(marker);
      }
      marker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
      selectedLocation = `${e.latlng.lat.toFixed(4)},${e.latlng.lng.toFixed(4)}`;
      mapConfirmBtn.classList.remove("hidden");
    });
  }

  // Fix map rendering issue
  setTimeout(() => {
    map.invalidateSize();
  }, 100);
}

// Mode switching
optionBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const mode = btn.dataset.mode;

    // Update active button
    optionBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    // Show/hide appropriate UI
    form.classList.add("hidden");
    mapContainer.classList.add("hidden");

    if (mode === "search") {
      form.classList.remove("hidden");
    } else if (mode === "map") {
      mapContainer.classList.remove("hidden");
      initMap();
    } else if (mode === "location") {
      // Get user's location
      if ("geolocation" in navigator) {
        loadingDiv.classList.remove("hidden");
        resultDiv.classList.add("hidden");
        errorBox.classList.add("hidden");

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = `${position.coords.latitude.toFixed(4)},${position.coords.longitude.toFixed(4)}`;
            fetchForecast(location);
          },
          (error) => {
            loadingDiv.classList.add("hidden");
            errorMessage.textContent = "Unable to get your location. Please enable location services.";
            errorBox.classList.remove("hidden");
          }
        );
      } else {
        errorMessage.textContent = "Geolocation is not supported by your browser.";
        errorBox.classList.remove("hidden");
      }
    }
  });
});

// Map confirm button
mapConfirmBtn.addEventListener("click", () => {
  if (selectedLocation) {
    fetchForecast(selectedLocation);
  }
});

// Fetch forecast data
async function fetchForecast(location) {
  resultDiv.classList.add("hidden");
  errorBox.classList.add("hidden");
  loadingDiv.classList.remove("hidden");
  submitBtn.disabled = true;

  try {
    const res = await fetch(`/forecast?location=${encodeURIComponent(location)}`);
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Unknown error");

    // Update current weather
    cityName.textContent = data.location;

    if (data.current) {
      temp.textContent = data.current.temp?.toFixed(1) ?? "N/A";
      conditions.textContent = data.current.conditions;
      weatherIcon.textContent = getWeatherIcon(data.current.conditions);
      temp.className = "temperature " + getTempColorClass(data.current.temp);

      feelsLike.textContent = `Feels like ${data.current.feelsLike?.toFixed(1)}°C`;
      humidity.textContent = `💧 ${data.current.humidity}%`;
      wind.textContent = `💨 ${data.current.windSpeed?.toFixed(1)} km/h`;
    }

    source.textContent = data.source === "cache" ? "📦 Cache" : "🌍 Live";

    // Display 7-day forecast
    if (data.forecast && data.forecast.length > 0) {
      forecastDays.innerHTML = "";

      data.forecast.forEach((day, index) => {
        const dayCard = document.createElement("div");
        dayCard.className = "forecast-day";

        const dateLabel = index === 0 ? "Today" : formatDate(day.date);

        dayCard.innerHTML = `
          <div class="forecast-date">${dateLabel}</div>
          <div class="forecast-icon">${getWeatherIcon(day.conditions)}</div>
          <div class="forecast-temps">
            <span class="forecast-high ${getTempColorClass(day.tempMax)}">${day.tempMax?.toFixed(0)}°</span>
            <span class="forecast-low">${day.tempMin?.toFixed(0)}°</span>
          </div>
          <div class="forecast-condition">${day.conditions}</div>
          <div class="forecast-details">
            <span>💧 ${day.precipProb}%</span>
          </div>
        `;

        forecastDays.appendChild(dayCard);
      });

      forecastContainer.classList.remove("hidden");
    }

    loadingDiv.classList.add("hidden");
    resultDiv.classList.remove("hidden");
  } catch (err) {
    loadingDiv.classList.add("hidden");
    errorMessage.textContent = err.message;
    errorBox.classList.remove("hidden");
  } finally {
    submitBtn.disabled = false;
  }
}

// Form submission
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (!city) return;

  fetchForecast(city);
});
