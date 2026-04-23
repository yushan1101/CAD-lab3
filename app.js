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

async function searchCity(input) {
  const query = input.trim();
  state.lastQuery = query;

  if (query.length < 2) {
    showValidation("Please enter at least 2 characters.");
    return;
  }

  showSkeleton();
}