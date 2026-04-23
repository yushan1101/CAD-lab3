(() => {
  const weatherCodes = {
    0: { text: "Clear sky", icon: "☀️" },
  1: { text: "Mainly clear", icon: "🌤️" },
  2: { text: "Partly cloudy", icon: "⛅" },
  3: { text: "Overcast", icon: "☁️" },
  45: { text: "Fog", icon: "🌫️" },
  48: { text: "Depositing rime fog", icon: "🌫️" },
  51: { text: "Light drizzle", icon: "🌦️" },
  53: { text: "Moderate drizzle", icon: "🌦️" },
  55: { text: "Heavy drizzle", icon: "🌧️" },
  56: { text: "Freezing drizzle", icon: "🌧️" },
  57: { text: "Dense freezing drizzle", icon: "🌧️" },
  61: { text: "Slight rain", icon: "🌦️" },
  63: { text: "Moderate rain", icon: "🌧️" },
  65: { text: "Heavy rain", icon: "🌧️" },
  66: { text: "Freezing rain", icon: "🌧️" },
  67: { text: "Heavy freezing rain", icon: "🌧️" },
  71: { text: "Slight snow", icon: "❄️" },
  73: { text: "Moderate snow", icon: "❄️" },
  75: { text: "Heavy snow", icon: "❄️" },
  77: { text: "Snow grains", icon: "❄️" },
  80: { text: "Slight rain showers", icon: "🌦️" },
  81: { text: "Moderate rain showers", icon: "🌧️" },
  82: { text: "Heavy rain showers", icon: "⛈️" },
  85: { text: "Slight snow showers", icon: "🌨️" },
  86: { text: "Heavy snow showers", icon: "🌨️" },
  95: { text: "Thunderstorm", icon: "⛈️" },
  96: { text: "Thunderstorm with hail", icon: "⛈️" },
  99: { text: "Heavy thunderstorm with hail", icon: "⛈️" }
  };

  const state = {
    unit: "C",
    lastQuery: "",
    weatherData: null,
    debounceTimer: null
  };

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const retryBtn = document.getElementById("retryBtn");
const validationMessage = document.getElementById("validationMessage");
const errorBanner = document.getElementById("errorBanner");
const errorText = document.getElementById("errorText");
const cityName = document.getElementById("cityName");
const weatherIcon = document.getElementById("weatherIcon");
const temperature = document.getElementById("temperature");
const weatherDescription = document.getElementById("weatherDescription");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const localTime = document.getElementById("localTime");
const forecastGrid = document.getElementById("forecastGrid");
const recentSearches = document.getElementById("recentSearches");
const unitButtons = document.querySelectorAll(".unit-btn");

async function searchCity(input) {
  const query = input.trim();
  state.lastQuery = query;

  if (query.length < 2) {
    showValidation("Please enter at least 2 characters.");
    return;
  }

  showSkeleton();

  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`;
    const geoData = await fetchJson(geoUrl);

    //If no results
    if (!geoData.results || geoData.results.length === 0) {
      showValidation("City not found. Please try another city.");
      clearDisplay();
      return;
    }

    const city = geoData.results[0];

    //Get weather
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;
    const weatherJson = await fetchJson(weatherUrl);

    //Format the data
    const data = formatWeatherData(city, weatherJson);
    state.weatherData = data;

    displayWeather(data);
}

function displayWeather(data) {
  //remove skeleton classes
    removeSkeleton(cityName);
    removeSkeleton(weatherIcon);
    removeSkeleton(temperature);
    removeSkeleton(weatherDescription);
    removeSkeleton(humidity);
    removeSkeleton(windSpeed);
    removeSkeleton(localTime);

    //populate all UI cards with real data
    cityName.textContent = data.city;
    weatherIcon.textContent = data.current.icon;
    temperature.textContent = `${convertTemp(data.current.tempC)}°${state.unit}`;
    weatherDescription.textContent = data.current.text;
    humidity.textContent = `${data.current.humidity}%`;
    windSpeed.textContent = `${data.current.wind} km/h`;
}

function removeSkeleton(el) {
    el.classList.remove("skeleton");
}