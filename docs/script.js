var owmAPI = "cdf22472458b933575b8154ed94c685e";
var currentCity = "";
var lastCity = "";
var searchInput = document.querySelector("#search-city");

var getWeather = (currentCity) => {
    let city = $('#search-city').val();
    currentCity = $('#search-city').val();
    // console.log(currentCity);
    let queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + currentCity + "&units=imperial" + "&appid=" + owmAPI;
    fetch(queryURL)
    .then((response) => {
        return response.json();
    })
    .then((response) => {
        saveToLocal(currentCity);
        $('#search-error').text("");
        let currentWeatherIcon="https://openweathermap.org/img/w/" + response.weather[0].icon + ".png";
        let currentTimeUTC = response.dt;
        let currentTimeZoneOffset = response.timezone;
        let currentTimeZoneOffsetHours = currentTimeZoneOffset / 60 / 60;
        let currentMoment = moment.unix(currentTimeUTC).utc().utcOffset(currentTimeZoneOffsetHours);
        getForecast(currentCity);
        let currentWeatherHTML = `
            <h2 class="bolded-text">${response.name} ${currentMoment.format("(MM/DD/YY)")}<img src="${currentWeatherIcon}"></h2>
            <ul class="list-unstyled">
                <li>Temp: ${response.main.temp}&#8457;</li>
                <br>
                <li>Wind: ${response.wind.speed} MPH</li>
                <br>
                <li>Humidity: ${response.main.humidity}%</li>
                <br>
                <li id="uvIndex">UV Index:</li>
            </ul>`;
        $('#current-weather').html(currentWeatherHTML);
        let latitude = response.coord.lat;
        let longitude = response.coord.lon;
        let uvQueryURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + latitude + "&lon=" + longitude + "&appid=" + owmAPI;
        // console.log(uvQueryURL);
        fetch(uvQueryURL)
        .then((response) => {
            return response.json();
        })
        .then((response) => {
            let uvIndex = response.current.uvi;
            $('#uvIndex').html(`UV Index: <span id="uvVal">${uvIndex}</span>`);
            if (uvIndex>=0 && uvIndex<3){
                $('#uvVal').attr("class", "uv-favorable");
            } else if (uvIndex>=3 && uvIndex<8){
                $('#uvVal').attr("class", "uv-moderate");
            } else if (uvIndex>=8){
                $('#uvVal').attr("class", "uv-severe");
            }
        })
    })
}

var getForecast = (currentCity) => {
    let queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + currentCity + "&units=imperial" + "&APPID=" + owmAPI;
    fetch(queryURL)
        .then((response) => {
            return response.json();
        })
        .then((response) => {
        let fiveDayForecastHTML = `
        <h2 class="bolded-text">5-Day Forecast:</h2>
        <div id="fiveDayForecastUl" class="d-inline-flex flex-wrap ">`;
        for (let i = 0; i < response.list.length; i++) {
            let dayData = response.list[i];
            let dayTimeUTC = dayData.dt;
            let timeZoneOffset = response.city.timezone;
            let timeZoneOffsetHours = timeZoneOffset / 60 / 60;
            let thisMoment = moment.unix(dayTimeUTC).utc().utcOffset(timeZoneOffsetHours);
            let iconURL = "https://openweathermap.org/img/w/" + dayData.weather[0].icon + ".png";
            if (thisMoment.format("HH:mm:ss") === "11:00:00" || thisMoment.format("HH:mm:ss") === "12:00:00" || thisMoment.format("HH:mm:ss") === "13:00:00") {
                fiveDayForecastHTML += `
                <div class="weather-card card m-2 p0">
                    <ul class="list-unstyled p-3">
                        <h4 class="bolded-text">${thisMoment.format("MM/DD/YY")}</h4>
                        <li class="weather-icon"><img src="${iconURL}"></li>
                        <li>Temp: ${dayData.main.temp}&#8457;</li>
                        <br>
                        <li>Wind: ${dayData.wind.speed} MPH</li>
                        <br>
                        <li>Humidity: ${dayData.main.humidity}%</li>
                    </ul>
                </div>`;
            }
        }
        fiveDayForecastHTML += `</div>`;
        $('#five-day-forecast').html(fiveDayForecastHTML);
    })
}

var renderCities = () => {
    $('#city-results').empty();
    if (localStorage.length === 0){
        if (lastCity){
            $('#search-city').attr("value", lastCity);
        } else {
            $('#search-city').attr("value", "Raleigh");
        }
    } else {
        let lastCityKey = "cities"+(localStorage.length-1);
        lastCity = localStorage.getItem(lastCityKey);
        $('#search-city').attr("value", lastCity);
        for (let i = 0; i < localStorage.length; i++) {
            let city = localStorage.getItem("cities" + i);
            let cityEl;
            if (currentCity === ""){
                currentCity = lastCity;
            }
            if (city === currentCity) {
                cityEl = `<button type="button" class="list-group-item list-group-item-action active">${city}</button></li>`;
            } else {
                cityEl = `<button type="button" class="list-group-item list-group-item-action">${city}</button></li>`;
            } 
            $('#city-results').prepend(cityEl);
        }
    }
    
}

$('#search-button').on("click", (event) => {
    event.preventDefault();
    var currentCity = $('#search-city').val();
    getWeather(currentCity);
});

$('#city-results').on("click", (event) => {
    event.preventDefault();
    $('#search-city').val(event.target.textContent);
    currentCity = $('#search-city').val();
    getWeather(currentCity);
});

var saveToLocal = (currentCity) => {
    var searchedCities = [];
    if (localStorage.getItem("city")) {
        searchedCities = JSON.parse(localStorage.getItem("city"))
    }
    if (searchedCities.length < 6) {
        searchedCities.push(currentCity)
    } else {
        searchedCities.splice(0, 1)
        searchedCities.push(currentCity)
    }
    localStorage.setItem("city", JSON.stringify(searchedCities));
    renderHistory()
};

var renderHistory = () => {
    var historyEl = document.querySelector("#city-results");
    historyEl.innerHTML = ""

    var history = JSON.parse(localStorage.getItem("city")) || [];

    if (history.length == 0) {
        var alertMessage = document.createElement("p")
        alertMessage.setAttribute("class", "h4a");
        alertMessage.textContent = "No history yet"
        historyEl.append(alertMessage)

    } else {
        for (let i = 0; i < history.length; i++) {
            let cityX = history[i];
            let cityEl;
            if (cityX === currentCity) {
                cityEl = `<button type="button" class="list-group-item list-group-item-action active">${cityX}</button></li>`;
            } else {
                cityEl = `<button type="button" class="list-group-item list-group-item-action active">${cityX}</button></li>`;
            } 
            $('#city-results').prepend(cityEl);
        }
    }
}