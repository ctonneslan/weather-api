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
  return "🌤️"; // default
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

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (!city) return;

  // Hide previous results and errors
  resultDiv.classList.add("hidden");
  errorBox.classList.add("hidden");
  loadingDiv.classList.remove("hidden");
  submitBtn.disabled = true;

  try {
    const res = await fetch(`/weather?city=${encodeURIComponent(city)}`);
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Unknown error");

    // Update content
    cityName.textContent = data.city;
    temp.textContent = data.tempC ?? "N/A";
    conditions.textContent = data.conditions;
    source.textContent = data.source === "cache" ? "📦 Cache" : "🌍 Live";
    weatherIcon.textContent = getWeatherIcon(data.conditions);

    // Add temperature color
    temp.className = "temperature " + getTempColorClass(data.tempC);

    // Show result with animation
    loadingDiv.classList.add("hidden");
    resultDiv.classList.remove("hidden");
  } catch (err) {
    loadingDiv.classList.add("hidden");
    errorMessage.textContent = err.message;
    errorBox.classList.remove("hidden");
  } finally {
    submitBtn.disabled = false;
  }
});
