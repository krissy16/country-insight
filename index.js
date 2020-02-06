'use strict'

function handleSubmit(){
    $('form').on('submit', function(event){
        event.preventDefault();
        const country = $('#country').val();
        clearOld();
        generateGeneral(country);
        showHidden();
    });
}

function scrollTo(place){
    $("html, body").stop().animate({scrollTop:$(`.${place}`).offset().top}, '500');
}

function showHidden(){
    $('.hidden').removeClass('hidden');

}

function clearOld(){
    $('#country').val("");
    $('.general-info').empty();
    $('.weather-info').empty();
    $('.currency-info').empty();
    $('.holiday-info').empty();
    if($('.main-curr-group')) $('.main-curr-group').remove();
    $('.error').each(function(item){$(this).remove();});
}

 function displayFailure(error, location){
    $(`.${location}`).append('<p class="error">Results could not be retrieved!</p>');
    console.log(error);

     if(location==='general'){
        displayFailure('Main API Failed!', 'weather');
        displayFailure('Main API Failed!', 'currency');
        displayFailure('Main API Failed!', 'holidays');
    }

 }

 function afterWait(basicInfo){
    populateGeneral(basicInfo);
    generateWeather(basicInfo.capital, basicInfo.alpha2Code);
    generateCurrency(basicInfo.currencies[0].code);
    generateHolidays(basicInfo.alpha2Code);
    scrollTo('results');
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
            displayFailure(err.message,'general');
        });
}

function populateGeneral(country){
    const location ='.general-info';
    addFlag('Flag of '+country.name, country.flag, country.name);
    addInfo('Population: ', country.population.toLocaleString(), location,'population');
    addInfo('Capital City: ', country.capital, location,'capital');
    addInfo('Language: ', country.languages[0].name, location,'language');
    addInfo('Region: ',country.subregion,location,'region')
}



function addFlag(caption, flag, countryName){
    const description = `Flag of ` + countryName;
    
    $('.general-info').append(`<li class="flag-group"><figure><img class="flag" src="${flag}" alt="${description}"><figcaption class="caption">${caption}</figcaption></figure></li>`);
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
            displayFailure(err.message, 'weather');
        });
}

function populateWeather(response){
    const location ='.weather-info';
    const weather = response.data[0];
    addWeatherIcon(weather.weather);
    addInfo('',weather.temp+'\u00B0F',location,'temperature');
}

function addWeatherIcon(weather){
    $('.weather-info').append(`<li class="weather-icon"><img src="/weather-icons/${weather.icon}.png" alt="${weather.description}"></li>`);
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
            displayFailure(err.message, 'currency');
        });
}

function populateCurrency(response){
    let keys = [];
    Object.keys(response.rates).map(key => keys.push(key));

    let mainCurr = `<div class="main-curr-group"><p class="main-currency">1 ${keys[0]}</p><img class="arrow" src="images/right-arrow.png" alt="arrow pointing right"></div>`;
    $(mainCurr).insertAfter($(".currency-title"));

    for(let i = 1 ; i < 10; i++){
        addInfo(keys[i]+': ',response.rates[keys[i]],'.currency-info','currency-item');
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
            displayFailure(err.message, 'holidays');
        });
}

function populateHolidays(response){
    const holidayList = response.response.holidays;
    for(let i=0; i<20; i++){
        const dateObj =holidayList[i].date.datetime;
        const date= dateObj.month+"/"+dateObj.day;
        const name=holidayList[i].name;
        const description = holidayList[i].description;
        
        //if it isnt first item, check for repeats
        if(i!=0)
            if(name !== holidayList[i-1].name)
                //if not a repeat add holiday to list
                addInfo(date+': ', name, '.holiday-info', 'holiday-item');
    }
}

function addInfo(title, data, location, classId){
    $(location).append(`<li class="${classId}">${title} ${data}</li>`);
}

function handleBack(){
    $('.back-txt').on('click', function(event){
        event.preventDefault();
        scrollTo('search');
    });
}


function handleClicks(){
    handleSubmit();
    handleBack();
}

$(handleClicks);