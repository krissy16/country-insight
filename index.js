function handleSubmit(){
    $('form').on('submit', function(event){
        event.preventDefault();
        const country = $('#country').val();
        $('#country').val("");
        generateGeneral(country);
        generateHolidays(country);
    });
}

 function displayFailure(error){

 }

 function afterWait(basicInfo){
    populateGeneral(basicInfo);
    generateWeather(basicInfo.capital);
    generateCurrency(basicInfo.currencies[0].code);
 }

// ====================================================
// ================== General Info ====================
// ====================================================
function generateGeneral(country){
    let url = "https://restcountries.eu/rest/v2/name/" + country;
    console.log("Retrieving results from " + url);

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
    addInfo('Population', country.population, location);
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
function generateWeather(country){
    console.log('this is a '+country);
    const api_key = '5c604124a65f4971adf89d59ef661c0c';
    let url = `https://api.weatherbit.io/v2.0/current?city=Raleigh,NC&key=${api_key}`;
    console.log("Retrieving results from " + url);

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
    const location ='.weather';
    const weather = response.data[0];
    addInfo('Time',weather.datetime,location);
    addInfo('Temperature',weather.temp,location)
    addWeatherIcon(weather.weather);
}

function addWeatherIcon(weather){
    $('.weather').append(`<li><img src="/weather-icons/${weather.icon}.png" alt="${weather.description}"></li>`);
}
// ====================================================
// ================== Currency Info ====================
// ====================================================
function generateCurrency(currencyCode){
    const url =`https://api.exchangerate-api.com/v4/latest/${currencyCode}`;
    console.log("Retrieving results from " + url);

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
    addInfo('Currency: ',JSON.stringify(response.rates),'.currency');
}

// ====================================================
// ================== Holiday Info ====================
// ====================================================
function generateHolidays(country){
    const api_key = 'd1f8e95017c5509e0b83f895e76b4799cbcbd6f0';
    let url = `https://calendarific.com/api/v2/holidays?&api_key=${api_key}&country=US&year=2019`;
    console.log("Retrieving results from " + url);

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
                addInfo(date, name, '.holidays');
    }
}

function addInfo(title, data, location){
    $(location).append(`<li>${title}: ${data}</li>`);
}


$(handleSubmit);