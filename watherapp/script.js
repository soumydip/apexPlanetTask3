document.getElementById('search-btn').addEventListener('click', () => {
    const city = document.getElementById('city-input').value;
    if (city) {
        getWeatherData(city);
    } else {
        alert('Please enter a city name!');
    }
});

document.getElementById('city-input').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const city = document.getElementById('city-input').value;
        if (city) {
            getWeatherData(city);
        } else {
            alert('Please enter a city name!');
        }
    }
});

async function getWeatherData(city) {
    const apiKey = 'b8ace2bcba35b7c1887bcfa4054c69d8';
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.cod === '404') {
            alert('City not found!');
            return;
        }

        // Get coordinates
        const lat = data.city.coord.lat;
        const lon = data.city.coord.lon;
        document.getElementById('coordinates').innerText = `Coordinates: Lat ${lat}, Lon ${lon}`;
        // Draw the map with the coordinates
        drawMap(lat, lon);

        // Extract forecast data and update the page
        updateWeatherInfo(data);
        drawWeatherGraph(data);
    } catch (error) {
        console.error('Error fetching the weather data:', error);
    }
}

function updateWeatherInfo(data) {
    const forecasts = {
        morning: null,
        afternoon: null,
        evening: null,
        overnight: null
    };

    data.list.forEach(item => {
        const hour = new Date(item.dt_txt).getHours();
        if (hour >= 6 && hour < 12) {
            forecasts.morning = item.main.temp;
        } else if (hour >= 12 && hour < 18) {
            forecasts.afternoon = item.main.temp;
        } else if (hour >= 18 && hour < 24) {
            forecasts.evening = item.main.temp;
        } else {
            forecasts.overnight = item.main.temp;
        }
    });

    // Update forecast info
    document.getElementById('forecast-info').innerHTML = `
        <p>Morning: ${forecasts.morning !== null ? forecasts.morning + '°C' : 'N/A'}</p>
        <p>Afternoon: ${forecasts.afternoon !== null ? forecasts.afternoon + '°C' : 'N/A'}</p>
        <p>Evening: ${forecasts.evening !== null ? forecasts.evening + '°C' : 'N/A'}</p>
        <p>Overnight: ${forecasts.overnight !== null ? forecasts.overnight + '°C' : 'N/A'}</p>
    `;

    // Update current weather info
    document.getElementById('city').innerText = `Current details: ${data.city.name}`;
    document.getElementById('temperature').innerHTML = `Temperature: ${data.list[0].main.temp}°C`;
    document.getElementById('description').innerText = `Description: ${data.list[0].weather[0].description}`;
    document.getElementById('feels-like').innerText = `Feels like: ${data.list[0].main.feels_like}°C`;

    // Additional weather details
    const windSpeed = data.list[0].wind.speed;
    const skyCondition = data.list[0].weather[0].main;
    const humidity = data.list[0].main.humidity;

    document.getElementById('wind-speed').innerText = `Wind Speed: ${windSpeed} m/s`;
    document.getElementById('sky-condition').innerText = `Sky Condition: ${skyCondition}`;
    document.getElementById('humidity').innerText = `Humidity: ${humidity}%`;
}

function drawWeatherGraph(data) {
    const canvas = document.getElementById('weatherCanvas');
    const ctx = canvas.getContext('2d');
    const tooltip = document.getElementById('tooltip');
    
    // Canvas clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get temperature data and labels
    const temps = data.list.slice(0, 8).map(item => item.main.temp); // First 8 hours' temperatures
    const labels = data.list.slice(0, 8).map(item => new Date(item.dt_txt).getHours() + ":00"); // Time labels
    const maxTemp = Math.max(...temps);
    const minTemp = Math.min(...temps);
    
    const canvasHeight = canvas.height;
    const canvasWidth = canvas.width;
    const topPadding = 40;
    const bottomPadding = 30;
    const leftPadding = 50;
    const rightPadding = 30;
    const graphHeight = canvasHeight - topPadding - bottomPadding;
    const graphWidth = canvasWidth - leftPadding - rightPadding;
    
    const yScale = graphHeight / (maxTemp - minTemp); 
    const xScale = graphWidth / (temps.length - 1);

    // Draw X-axis labels
    ctx.fillStyle = 'black';
    ctx.font = '14px Arial';
    labels.forEach((label, index) => {
        const xPos = leftPadding + index * xScale;
        ctx.fillText(label, xPos - 15, canvasHeight - bottomPadding + 20); // Adjusted position for X-axis labels
    });

    // Draw graph
    ctx.beginPath();
    ctx.moveTo(leftPadding, canvasHeight - bottomPadding - (temps[0] - minTemp) * yScale);
    
    temps.forEach((temp, index) => {
        const xPos = leftPadding + index * xScale;
        const yPos = canvasHeight - bottomPadding - (temp - minTemp) * yScale;
        ctx.lineTo(xPos, yPos);
    });

    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw points
    ctx.fillStyle = 'red';
    temps.forEach((temp, index) => {
        const xPos = leftPadding + index * xScale;
        const yPos = canvasHeight - bottomPadding - (temp - minTemp) * yScale;
        ctx.beginPath();
        ctx.arc(xPos, yPos, 5, 0, Math.PI * 2, true);
        ctx.fill();
    });

    // Y-axis temperature labels
    ctx.fillStyle = 'black';
    ctx.font = '12px Arial';
    const labelInterval = (maxTemp - minTemp) / 5;
    for (let i = 0; i <= 5; i++) {
        const tempLabel = minTemp + (labelInterval * i);
        const yPos = canvasHeight - bottomPadding - (tempLabel - minTemp) * yScale;
        ctx.fillText(tempLabel.toFixed(1) + '°C', leftPadding - 40, yPos + 5); // Adjusted position for Y-axis labels
    }

    // Draw X-axis and Y-axis lines
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.moveTo(leftPadding, canvasHeight - bottomPadding);
    ctx.lineTo(leftPadding + graphWidth, canvasHeight - bottomPadding);
    ctx.moveTo(leftPadding, canvasHeight - bottomPadding);
    ctx.lineTo(leftPadding, topPadding);
    ctx.stroke();

    // Mousemove event for tooltip
    canvas.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const index = Math.round((x - leftPadding) / xScale);
        if (index >= 0 && index < temps.length) {
            const temp = temps[index];
            const label = labels[index];
            tooltip.innerHTML = `Time: ${label}<br>Temp: ${temp}°C`;
            tooltip.style.left = `${event.clientX + 10}px`;
            tooltip.style.top = `${event.clientY + 10}px`;
            tooltip.style.display = 'block';
        } else {
            tooltip.style.display = 'none';
        }
    });

    // Mouseout event to hide tooltip
    canvas.addEventListener('mouseout', () => {
        tooltip.style.display = 'none';
    });
}

// Map
let map; // Declare map variable globally

function drawMap(lat, lon) {
    // If the map already exists, remove it before creating a new one
    if (map) {
        map.remove(); // Remove the existing map instance
    }

    // Initialize the map
    map = L.map('map').setView([lat, lon], 10); // Set map view with zoom level 10

    // Define base layer
    const baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Add a marker to the map at the searched location
    L.marker([lat, lon]).addTo(map)
        .bindPopup('You are here')
        .openPopup();
}
