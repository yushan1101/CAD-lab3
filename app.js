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

function init() {
  showForecastSkeleton();
  loadRecentSearches();
  bindEvents();
  searchCity("Kuala Lumpur");
}

/*--------- Button click -----*/
function bindEvents() {
  searchBtn.addEventListener("click", () => searchCity(cityInput.value));

  cityInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      searchCity(cityInput.value);
    }
  });

  cityInput.addEventListener("input", () => {
    clearTimeout(state.debounceTimer);
    state.debounceTimer = setTimeout(() => {
      if (cityInput.value.trim().length >= 2) {
        searchCity(cityInput.value);
      }
    }, 500);
  });

  retryBtn.addEventListener("click", () => {
    if (state.lastQuery) {
      searchCity(state.lastQuery);
    }
  });

  unitButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      state.unit = btn.dataset.unit;
      unitButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      if (state.weatherData) {
        displayWeather(state.weatherData);
      }
    });
  });
}

/*-------- Search City --------*/
async function searchCity(input) {
  const query = input.trim();
  state.lastQuery = query;

  hideValidation();
  hideError();

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
    saveRecentSearch(query);
    getLocalTime(data.timezone);
  }
  catch (error) {
      if (error.name === "AbortError") {
        showError("Request timed out after 10 seconds.");
      } else {
        showError(error.message);
      }
    }
}

async function fetchJson(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    return await response.json();
  } 
  finally {
    clearTimeout(timeoutId);
  }
}

function formatWeatherData(city, json) {
  const currentCode = json.current_weather.weathercode;
  const currentInfo = weatherCodes[currentCode] || { text: "Unknown", icon: "❔" };

  const currentIndex = json.hourly.time.indexOf(json.current_weather.time);
  const humidityValue =
    currentIndex >= 0 ? json.hourly.relativehumidity_2m[currentIndex] : "N/A";

  return {
    city: `${city.name}, ${city.country}`,
    timezone: city.timezone || json.timezone,
    current: {
      tempC: json.current_weather.temperature,
      wind: json.current_weather.windspeed,
      humidity: humidityValue,
      text: currentInfo.text,
      icon: currentInfo.icon
    },
    forecast: json.daily.time.map((date, index) => {
      const codeInfo = weatherCodes[json.daily.weathercode[index]] || {
        text: "Unknown",
        icon: "❔"
      };

      return {
        date: date,
        icon: codeInfo.icon,
        text: codeInfo.text,
        max: json.daily.temperature_2m_max[index],
        min: json.daily.temperature_2m_min[index]
      };
    })
  };
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

    if (!localTime.dataset.loaded) {
      localTime.textContent = new Date().toLocaleString();
    }

    displayForecast(data.forecast);
}

function displayForecast(forecast) {
  forecastGrid.innerHTML = "";

  forecast.forEach((day) => {
    const card = document.createElement("div");
    card.className = "forecast-card";
    card.innerHTML = `
      <p class="day-name">${getDayName(day.date)}</p>
      <p class="forecast-icon">${day.icon}</p>
      <p class="forecast-text">${day.text}</p>
      <p class="forecast-temp">${convertTemp(day.max)}° / ${convertTemp(day.min)}°</p>
    `;
    forecastGrid.appendChild(card);
  });
}

function getLocalTime(timezone) {
    if (!timezone) {
      localTime.textContent = new Date().toLocaleString();
      localTime.dataset.loaded = "fallback";
      return;
    }

    $.getJSON(`https://worldtimeapi.org/api/timezone/${timezone}`)
      .done(function (timeData) {
        localTime.textContent = new Date(timeData.datetime).toLocaleString();
        localTime.dataset.loaded = "api";
      })
      .fail(function () {
        localTime.textContent = new Date().toLocaleString();
        localTime.dataset.loaded = "fallback";
      })
      .always(function () {
        console.log("Time request completed at:", new Date().toISOString());
      });
  }

function convertTemp(celsius) {
  if (state.unit === "F") {
    return Math.round((celsius * 9) / 5 + 32);
  }
  return Math.round(celsius);
}

function getDayName(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", { weekday: "short" });
}

function showValidation(message) {
  validationMessage.textContent = message;
  validationMessage.classList.remove("hidden");
}

function hideValidation() {
  validationMessage.classList.add("hidden");
}

function showError(message) {
  errorText.textContent = message;
  errorBanner.classList.remove("hidden");
}

function hideError() {
  errorBanner.classList.add("hidden");
}

function showSkeleton() {
  [cityName, weatherIcon, temperature, weatherDescription, humidity, windSpeed, localTime]
    .forEach((el) => el.classList.add("skeleton"));

  showForecastSkeleton();
  localTime.dataset.loaded = "";
}

function removeSkeleton(el) {
    el.classList.remove("skeleton");
}

function showForecastSkeleton() {
  forecastGrid.innerHTML = "";
  for (let i = 0; i < 7; i++) {
    const card = document.createElement("div");
    card.className = "forecast-card skeleton";
    card.innerHTML = "&nbsp;<br>&nbsp;<br>&nbsp;<br>&nbsp;";
    forecastGrid.appendChild(card);
  }
}

function clearDisplay() {
  cityName.textContent = "No city found";
  weatherIcon.textContent = "❔";
  temperature.textContent = "--";
  weatherDescription.textContent = "No data";
  humidity.textContent = "--";
  windSpeed.textContent = "--";
  localTime.textContent = new Date().toLocaleString();
  displayForecast([]);
}

function saveRecentSearch(city) {
  let items = JSON.parse(localStorage.getItem("recentCities")) || [];
  items = [city, ...items.filter((item) => item.toLowerCase() !== city.toLowerCase())];
  items = items.slice(0, 5);
  localStorage.setItem("recentCities", JSON.stringify(items));
  renderRecentSearches(items);
}

function loadRecentSearches() {
  const items = JSON.parse(localStorage.getItem("recentCities")) || [];
  renderRecentSearches(items);
}

function renderRecentSearches(items) {
  recentSearches.innerHTML = "";

  items.forEach((city) => {
    const chip = document.createElement("button");
    chip.className = "chip";
    chip.textContent = city;
    chip.addEventListener("click", () => {
      cityInput.value = city;
      searchCity(city);
    });
    recentSearches.appendChild(chip);
  });
}

  init();
})();