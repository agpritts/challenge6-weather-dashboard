var userCity = "";
var userLat = "";
var userLong = "";
var todayDate = new Date();
var endDate = new Date();
endDate.setDate(todayDate.getDate()+4);
endDate.setHours(24);
var container1 = document.getElementById('place1');
var container2 = document.getElementById('place2');
var container3 = document.getElementById('place3');
var container4 = document.getElementById('place4');
var container5 = document.getElementById('place5');

var takeInput = function() {
    localStorage.setItem("userCity", userCity);
};

var displayTime = function() {
    // loop through the 5 upcoming days and append to page
    for (let i = 0; i < 5; i++) {
        var startDay = moment().isoWeekday();
        var time = moment().day(startDay + i).format('dddd </br> MM/DD');
        $("#day" + (i + 1)).html(time);
    }
};

function firstAPI() {
    fetch('https://api.openweathermap.org/data/2.5/weather?q=' + userCity + '&appid=cdf22472458b933575b8154ed94c685e')
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        userLat = data.coord.lat;
        userLong = data.coord.lon;
        secondAPI();
    });
};

function secondAPI() {
    fetch('https://api.openweathermap.org/data/2.5/onecall?lat=' + userLat + '&lon=' + userLong + '&exclude=current,minutely,hourly&units=imperial&appid=cdf22472458b933575b8154ed94c685e')
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        for (let i = 0; i < 5; i++) {
            var containerX = document.getElementById('place' + (i + 1))
            var temp1 = document.createElement('p');
            temp1.textContent = 'Temp: ' + data.daily[i].temp + '°F';
            containerX.appendChild(temp1);
            var wind1 = document.createElement('p');
            wind1.textContent = 'Wind: ' + data.daily[i].wind_speed + 'MPH';
            containerX.appendChild(wind1);
            var hum1 = document.createElement('p');
            hum1.textContent = 'Humidity: ' + data.daily[i].humidity + '%';
            containerX.appendChild(hum1);
            var icon1 = document.createElement('img');
            icon1.src = 'http://openweathermap.org/img/wn/' + data.daily[i].weather[0].icon + '@2x.png';
            containerX.appendChild(icon1);
        }
    })
};