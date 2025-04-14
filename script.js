const API_KEY = 'b27cee92579efc9c94a57db60d675a33';
const themeSwitch = document.getElementById('theme-switch');
const body = document.body;

// Weather Images Mapping
const weatherImages = {
    Clear: 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7',
    Clouds: 'https://images.unsplash.com/photo-1483977399921-6cf94f6fdc3a',
    Rain: 'https://images.unsplash.com/photo-1519692933481-e162a57d6721',
    Thunderstorm: 'https://images.unsplash.com/photo-1562155618-e1a8bc2eb04f',
    Snow: 'https://images.unsplash.com/photo-1483664852095-d6cc6870702d',
    Haze: 'https://images.unsplash.com/photo-1501696461415-6bd6660c6742'
};

// AQI Status Configuration
const aqiStatus = {
    1: { text: 'Good', emoji: '😊', color: '#4CAF50' },
    2: { text: 'Fair', emoji: '🙂', color: '#8BC34A' },
    3: { text: 'Moderate', emoji: '😐', color: '#FFEB3B' },
    4: { text: 'Poor', emoji: '😷', color: '#FF9800' },
    5: { text: 'Very Poor', emoji: '😨', color: '#F44336' }
};

// Theme Toggle
themeSwitch.addEventListener('change', () => {
    body.classList.toggle('dark-mode');
});

// Date/Time Updater
function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    document.getElementById('datetime').textContent = now.toLocaleDateString('en-US', options);
}
setInterval(updateDateTime, 1000);

// Location Fetch on Refresh
window.onload = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                getWeatherByCoords(position.coords.latitude, position.coords.longitude);
            },
            error => {
                console.error('Error getting location:', error);
                getWeatherData('London');
            }
        );
    }
};

// Weather Data Fetching
async function getWeatherData(city) {
    try {
        const weatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
        );
        const weatherData = await weatherResponse.json();

        const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
        );
        const forecastData = await forecastResponse.json();

        const aqiResponse = await fetch(
            `http://api.openweathermap.org/data/2.5/air_pollution?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&appid=${API_KEY}`
        );
        const aqiData = await aqiResponse.json();

        updateWeatherUI(weatherData, forecastData, aqiData);
        sendWeatherAlert(weatherData); // Send weather alert after updating UI
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
}

async function getWeatherByCoords(lat, lon) {
    try {
        const weatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );
        const weatherData = await weatherResponse.json();
        
        const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );
        const forecastData = await forecastResponse.json();

        const aqiResponse = await fetch(
            `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
        );
        const aqiData = await aqiResponse.json();

        updateWeatherUI(weatherData, forecastData, aqiData);
        sendWeatherAlert(weatherData); // Send weather alert after updating UI
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
}

// UI Updaters
function updateWeatherUI(weatherData, forecastData, aqiData) {
    // Update current weather
    document.getElementById('city-name').innerHTML = 
        `<i class="fas fa-map-marker-alt"></i> ${weatherData.name}, ${weatherData.sys.country}`;
    document.getElementById('temperature').textContent = 
        `${Math.round(weatherData.main.temp)}°C`;
    document.getElementById('weather-condition').textContent = 
        weatherData.weather[0].main;
    document.getElementById('humidity').textContent = 
        `${weatherData.main.humidity}%`;
    document.getElementById('wind-speed').textContent = 
        `${weatherData.wind.speed}m/s`;
   
    document.getElementById('pressure').textContent = 
        `${weatherData.main.pressure}hPa`;
    document.getElementById('sunrise').textContent = 
        new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString();
    document.getElementById('sunset').textContent = 
        new Date(weatherData.sys.sunset * 1000).toLocaleTimeString();

    // Update AQI
    const aqiValue = aqiData.list[0].main.aqi;
    const aqiInfo = aqiStatus[aqiValue] || aqiStatus[1];
    document.getElementById('aqi-value').textContent = aqiValue * 20; // Convert to hundreds
    document.getElementById('aqi-status').textContent = aqiInfo.text;
    document.getElementById('aqi-emoji').textContent = aqiInfo.emoji;
    document.getElementById('aqi-value').style.color = aqiInfo.color;

    // Update background
    const weatherCondition = weatherData.weather[0].main;
    document.getElementById('weather-bg').style.backgroundImage = 
        `url(${weatherImages[weatherCondition] || weatherImages.Clear})`;

    // Update forecasts
    updateHourlyForecast(forecastData);
    updateWeeklyForecast(forecastData);

    // Update suggestions
    updateSuggestions(weatherData);
}

function updateHourlyForecast(forecastData) {
    const hourlyList = document.getElementById('hourly-list');
    hourlyList.innerHTML = forecastData.list.slice(0, 8).map(item => `
        <div class="forecast-item">
            <div>${new Date(item.dt * 1000).getHours()}:00</div>
            <img src="http://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="${item.weather[0].main}">
            <div>${Math.round(item.main.temp)}°C</div>
        </div>
    `).join('');
}

function updateWeeklyForecast(forecastData) {
    const weeklyList = document.getElementById('weekly-list');
    const dailyForecast = forecastData.list.filter((_, index) => index % 8 === 0);
    weeklyList.innerHTML = dailyForecast.map(item => `
        <div class="forecast-item">
            <div>${new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}</div>
            <img src="http://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="${item.weather[0].main}">
            <div>${Math.round(item.main.temp)}°C</div>
            <div>${item.weather[0].main}</div>
        </div>
    `).join('');
}

function updateSuggestions(weatherData) {
    const suggestionsList = document.getElementById('suggestions-list');
    const condition = weatherData.weather[0].main.toLowerCase();
    let suggestions = [];

    if (condition.includes('rain')) {
        suggestions.push(
            '<img src="assets/umbrella.png" alt="Umbrella" class="suggestion-icon"><br> Umbrella: Required', 
            '<img src="assets/sunscreen.png" alt="Sunscreen" class="suggestion-icon"><br> Sunscreen:No',
            '<img src="assets/driving2.png" alt="Breathable Clothing" class="suggestion-icon"><br> Driving:Be cautious!',
            '<img src="assets/noclothes.jpg" alt="Clothes" class="suggestion-icon"><br> Dry Cloths:No',
        );
    } else if (condition.includes('clear')) {
        suggestions.push(
            '<img src="assets/noumbrella.png" alt="Umbrella" class="suggestion-icon"><br> Umbrella: Not Required', 
            '<img src="assets/sunscreen.png" alt="Sunscreen" class="suggestion-icon"><br> Sunscreen: Continuously Apply', 
            '<img src="assets/driving2.png" alt="Driving" class="suggestion-icon"><br> Enjoy Driving',
            '<img src="assets/clothes.png" alt="Jacket" class="suggestion-icon"><br> DryCloths:Yes'
        );
    } else if (condition.includes('clouds')) {
        suggestions.push(
            '<img src="assets/umbrella.png" alt="Umbrella" class="suggestion-icon"> Umbrella: Maybe', 
            '<img src="assets/sunscreen.png" alt="Breathable Clothing" class="suggestion-icon"><br> Sunscreen: Yes', 
            '<img src="assets/driving2.png" alt="Driving" class="suggestion-icon"><br> Driving: Normal',
            '<img src="assets/clothes.png" alt="Jacket" class="suggestion-icon"><br> DryCloths: Yes'
        );
    }
    else if (condition.includes('haze')) {
        suggestions.push(
            '<img src="assets/noumbrella.png" alt="Umbrella" class="suggestion-icon"> Umbrella: Not Required', 
            '<img src="assets/sunscreen.png" alt="Breathable Clothing" class="suggestion-icon"><br> Sunscreen: Yes', 
            '<img src="assets/driving2.png" alt="Driving" class="suggestion-icon"><br> Driving: Be cautious!',
            '<img src="assets/noclothes.jpg" alt="Jacket" class="suggestion-icon"><br> DryCloths: No'
        );
    }
    else if (condition.includes('snow')) {
        suggestions.push(
            '<img src="assets/umbrella.png" alt="Umbrella" class="suggestion-icon"> Umbrella: Required', 
            '<img src="assets/sunscreen.png" alt="Breathable Clothing" class="suggestion-icon"><br> Sunscreen: Yes', 
            '<img src="assets/driving2.png" alt="Driving" class="suggestion-icon"><br> Driving: Be cautious!',
            '<img src="assets/noclothes.jpg" alt="Jacket" class="suggestion-icon"><br> DryCloths: No'
        );
    }
    else if (condition.includes('thunderstorm')) {
        suggestions.push(
            '<img src="assets/umbrella.png" alt="Umbrella" class="suggestion-icon"> Umbrella:  Required', 
            '<img src="assets/sunscreen.png" alt="Breathable Clothing" class="suggestion-icon"><br> Sunscreen: No', 
            '<img src="assets/driving2.png" alt="Driving" class="suggestion-icon"><br> Driving: Be cautious!',
            '<img src="assets/noclothes.jpg" alt="Jacket" class="suggestion-icon"><br> DryCloths: No'
        );
    }
    suggestionsList.innerHTML = suggestions.map(s => `<div class="suggestion-item">${s}</div>`).join('');
}

// Event Listeners
document.getElementById('search-btn').addEventListener('click', () => {
    const city = document.getElementById('location-input').value;
    if (city) getWeatherData(city);
});

// Initial Load
updateDateTime();









// API Key for OpenWeatherMap


// Request Permission for Notifications
async function requestNotificationPermission() {
    if (Notification.permission === "default" || Notification.permission === "denied") {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            showNotification("🔔 Notifications Enabled", "You will receive weather alerts.");
        }
    }
}

// Function to Show Notification
function showNotification(title, message) {
    if (Notification.permission === "granted") {
        new Notification(title, { body: message, icon: "" });
    } else {
        console.log("Notification blocked by user.");
    }
}

// Function to Fetch Weather and AQI Data
async function getWeatherData(city) {
    function sendWeatherAlert(weatherData, aqiData) {
        if (!weatherData || !aqiData.list) {
            console.error("❌ Missing weather or AQI data for alerts!");
            return;
        }
    
        // Extract AQI Value
        const aqiValue = aqiData.list[0].main.aqi * 20; // ✅ Convert to match website
        let airQuality = "";
    
        if (aqiValue <= 20) {
            airQuality = "Good 😊";
        } else if (aqiValue <= 40) {
            airQuality = "Fair 🙂";
        } else if (aqiValue <= 60) {
            airQuality = "Moderate 😐";
        } else if (aqiValue <= 80) {
            airQuality = "Poor 😷";
        } else {
            airQuality = "Very Poor 😨";
        }
    
        console.log("Corrected AQI Value:", aqiValue);
        console.log("Mapped AQI Status:", airQuality);
    
        // Show alert with weather and air quality
        alert(`🌦️ It is ${weatherData.weather[0].description.toLowerCase()} and air quality is ${airQuality}.`);
    }
    
    try {
        const weatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
        );
        const weatherData = await weatherResponse.json();

        if (!weatherData || weatherData.cod !== 200) {
            throw new Error('Invalid weather data received');
        }

        const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
        );
        const forecastData = await forecastResponse.json();

        if (!forecastData || forecastData.cod !== "200") {
            throw new Error('Invalid forecast data received');
        }

        const aqiResponse = await fetch(
            `http://api.openweathermap.org/data/2.5/air_pollution?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&appid=${API_KEY}`
        );
        const aqiData = await aqiResponse.json();

        if (!aqiData || !aqiData.list) {
            throw new Error('Invalid AQI data received');
        }

        updateWeatherUI(weatherData, forecastData, aqiData);
        const alertSwitch = document.getElementById("alert-switch");
        if (alertSwitch && alertSwitch.checked) {
            sendWeatherAlert(weatherData, aqiData);
        }
    } catch (error) {
        console.error('Error fetching weather data:', error);
        // Optionally, display an error message to the user
    }
    
    
}

async function getWeatherByCoords(lat, lon) {
    function sendWeatherAlert(weatherData, aqiData) {
        if (!weatherData || !aqiData.list) {
            console.error("❌ Missing weather or AQI data for alerts!");
            return;
        }
    
        // Extract AQI Value
        const aqiValue = aqiData.list[0].main.aqi * 20; // ✅ Convert to match website
        let airQuality = "";
    
        if (aqiValue <= 20) {
            airQuality = "Good 😊";
        } else if (aqiValue <= 40) {
            airQuality = "Fair 🙂";
        } else if (aqiValue <= 60) {
            airQuality = "Moderate 😐";
        } else if (aqiValue <= 80) {
            airQuality = "Poor 😷";
        } else {
            airQuality = "Very Poor 😨";
        }
    
        console.log("Corrected AQI Value:", aqiValue);
        console.log("Mapped AQI Status:", airQuality);
    
        // Show alert with weather and air quality
        alert(`🌦️ It is ${weatherData.weather[0].description.toLowerCase()} and air quality is ${airQuality}.`);
    }
    

    try {
        const weatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );
        const weatherData = await weatherResponse.json();

        if (!weatherData || weatherData.cod !== 200) {
            throw new Error('Invalid weather data received');
        }

        const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );
        const forecastData = await forecastResponse.json();

        if (!forecastData || forecastData.cod !== "200") {
            throw new Error('Invalid forecast data received');
        }

        const aqiResponse = await fetch(
            `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
        );
        const aqiData = await aqiResponse.json();

        if (!aqiData || !aqiData.list) {
            throw new Error('Invalid AQI data received');
        }

        updateWeatherUI(weatherData, forecastData, aqiData);
        const alertSwitch = document.getElementById("alert-switch");
        if (alertSwitch && alertSwitch.checked) {
            sendWeatherAlert(weatherData, aqiData);
        }    } catch (error) {
        console.error('Error fetching weather data:', error);
        // Optionally, display an error message to the user
    }
}

// Function to Send Weather Alert Notification
function sendWeatherAlert(weatherData) {
    const location = weatherData.name;
    const aqiValue = weatherData.main.aqi;
    const weatherCondition = weatherData.weather[0].main;

    showNotification("🌤️ Weather Alert", `📍 Location: ${location}\n🌫️ AQI: ${aqiValue}\n🌦️ Weather: ${weatherCondition}`);
}

// Function to Check for Weather Updates Periodically
async function checkForWeatherChanges() {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        await getWeatherByCoords(latitude, longitude);
    });
}

document.addEventListener("DOMContentLoaded", function () {
    function attachAlertListener() {
        let alertSwitch = document.getElementById("alert-switch");

        if (!alertSwitch) {
            console.warn("⚠️ Alert switch not found! Retrying...");
            setTimeout(attachAlertListener, 500);
            return;
        }

        alertSwitch.addEventListener("change", function () {
            if (alertSwitch.checked) {
                alert("✅ Alerts Enabled Successfully!");

                // ✅ Trigger Weather Alert Immediately After Enabling
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        position => {
                            getWeatherByCoords(position.coords.latitude, position.coords.longitude);
                        },
                        error => {
                            console.error("❌ Geolocation error:", error);
                            getWeatherData("Delhi"); // Default to Delhi if location fails
                        }
                    );
                } else {
                    getWeatherData("Delhi");
                }
            }
        });

        console.log("✅ Alert switch listener attached.");
    }

    attachAlertListener();
});

