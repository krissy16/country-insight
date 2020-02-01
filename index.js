'use strict'

function handleSubmit(){
    $('form').on('submit', function(event){
        event.preventDefault();
        const country = $('#country').val();
        clearOld();
        generateGeneral(country);
    });
}

function clearOld(){
    $('#country').val("");
    $('.general-info').empty();
    $('.weather-info').empty();
    $('.currency-info').empty();
    $('.holiday-info').empty();

}

 function displayFailure(error){

 }

 function afterWait(basicInfo){
    populateGeneral(basicInfo);
    generateWeather(basicInfo.capital, basicInfo.alpha2Code);
    generateCurrency(basicInfo.currencies[0].code);
    generateHolidays(basicInfo.alpha2Code);
 }

// ====================================================
// ================== General Info ====================
// ====================================================
function generateGeneral(country){
    let url = "https://restcountries.eu/rest/v2/name/" + country;
    console.log("Retrieving general results from " + url);

    fetch(url)
        .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error(response.statusText);
        })
        .then(responseJson => {
            afterWait(responseJson[0]);
        })
        .catch(err => {
            console.log(err.message);
            displayFailure(err.message);
        });
}

function populateGeneral(country){
    const location ='.general-info';
    addInfo('Name', country.name, location);
    addInfo('Capital', country.capital, location);
    addInfo('Population', country.population.toLocaleString(), location);
    addInfo('Language', country.languages[0].name, location);
    addFlag('Flag', country.flag, country.name);
}



function addFlag(title, data, countryName){
    const description = `Flag of ` + countryName;
    $('.general-info').append(`<li>${title}: <img src="${data}" alt="${description}"></li>`);
}

// ====================================================
// ================== Weather Info ====================
// ====================================================
function generateWeather(capital, countryCode){
    console.log('Retrieving weather for '+capital+", "+countryCode);
    const api_key = '5c604124a65f4971adf89d59ef661c0c';
    let url = `https://api.weatherbit.io/v2.0/current?city=${capital},${countryCode}&key=${api_key}&units=I`;
    console.log("Retrieving weather results from " + url);

    fetch(url)
        .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error(response.statusText);
        })
        .then(responseJson => {
            populateWeather(responseJson);
        })
        .catch(err => {
            console.log(err.message);
            displayFailure(err.message);
        });
}

function populateWeather(response){
    const location ='.weather-info';
    const weather = response.data[0];
    addInfo('Time',formatDate(weather.ob_time),location);
    addInfo('Temperature',weather.temp+'\u00B0F',location)
    addWeatherIcon(weather.weather);
    addInfo('Time of Day',weather.pod,location);

}

function formatDate(date){
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const year = date.slice(0,4);
    const month= date.slice(5,7);
    const day = date.slice(8,10);
    const hour = date.slice(11,16)
    let formatedDate= months[parseInt(month)-1] +" "+ day+", "+year+" about "+hour;

    return formatedDate;
}

function addWeatherIcon(weather){
    $('.weather-info').append(`<li><img src="/weather-icons/${weather.icon}.png" alt="${weather.description}"></li>`);
}
// ====================================================
// ================== Currency Info ====================
// ====================================================
function generateCurrency(currencyCode){
    const url =`https://api.exchangerate-api.com/v4/latest/${currencyCode}`;
    console.log("Retrieving currency results from " + url);

    fetch(url)
        .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error(response.statusText);
        })
        .then(responseJson => {
            populateCurrency(responseJson);
        })
        .catch(err => {
            console.log(err.message);
            displayFailure(err.message);
        });
}

function populateCurrency(response){
    let keys = [];
    Object.keys(response.rates).map(key => keys.push(key));
    // addInfo(key,response.rates[key],'.currency-info')
    addInfo('Currency','1 '+keys[0],'.currency-info')
    for(let i = 1 ; i < 10; i++){
        addInfo(keys[i],response.rates[keys[i]],'.currency-info')
    }
}

// ====================================================
// ================== Holiday Info ====================
// ====================================================
function generateHolidays(countryCode){
    const api_key = 'd1f8e95017c5509e0b83f895e76b4799cbcbd6f0';
    const year = new Date().getFullYear();
    let url = `https://calendarific.com/api/v2/holidays?&api_key=${api_key}&country=${countryCode}&year=${year}`;
    console.log("Retrieving holiday results from " + url);

    fetch(url)
        .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error(response.statusText);
        })
        .then(responseJson => {
            populateHolidays(responseJson);
        })
        .catch(err => {
            console.log(err.message);
            displayFailure(err.message);
        });
}

function populateHolidays(response){
    const holidayList = response.response.holidays;
    for(let i=0; i<10; i++){
        const dateObj =holidayList[i].date.datetime;
        const date= dateObj.month+"/"+dateObj.day+"/"+dateObj.year;
        const name=holidayList[i].name;
        const description = holidayList[i].description;
        if(i!=0)
            if(name !== holidayList[i-1].name)
                addInfo(date, name, '.holiday-info');
    }
}

function addInfo(title, data, location){
    $(location).append(`<li>${title}: ${data}</li>`);
}


$(handleSubmit);