const form = document.getElementById("weather-form");
const cityInput = document.getElementById("city-input");
const resultDiv = document.getElementById("result");
const cityName = document.getElementById("city-name");
const temp = document.getElementById("temp");
const conditions = document.getElementById("conditions");
const source = document.getElementById("source");
const errorMsg = document.getElementById("error");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (!city) return;

  resultDiv.classList.add("hidden");
  errorMsg.classList.add("hidden");

  try {
    const res = await fetch(`/weather?city=${encodeURIComponent(city)}`);
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Unknown error");

    cityName.textContent = data.city;
    temp.textContent = data.tempC ?? "N/A";
    conditions.textContent = data.conditions;
    source.textContent = data.source;

    resultDiv.classList.remove("hidden");
  } catch (err) {
    errorMsg.textContent = err.message;
    errorMsg.classList.remove("hidden");
  }
});
