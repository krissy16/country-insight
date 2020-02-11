'use strict'

function handleSubmit(){
    $('form').on('submit', function(event){
        event.preventDefault();
        const country = $('#country').val();
        clearOld();
        generateGeneral(country);
        showHidden();
        scrollTo('results');
    });
}

function scrollTo(place){
    let offset = 0;
    if(place === 'results') offset=15;
    else if(place==='search') $('#country').focus();
    $("html, body").stop().animate({scrollTop:$(`.${place}`).offset().top-offset}, '500');
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
    $('.more').removeClass('down').removeClass('hidden');
    
    $('ul').addClass('hidden');
    $('.currency').css('display','flex');
    
}

 function displayFailure(error, location){
    $(`.${location}`).append('<p class="error">Results could not be retrieved!</p>');
    console.log(error);

     if(location==='general'){
        displayFailure('Main API Failed!', 'weather');
        displayFailure('Main API Failed!', 'currency');
        displayFailure('Main API Failed!', 'holidays');
    }
    else if(location==='currency') $('.currency').css('display','block');

    $(`.${location} .more`).addClass('hidden');
    $(`.${location} ul`).addClass('hidden');

 }

 function afterWait(basicInfo){
    populateGeneral(basicInfo);
    generateWeather(basicInfo.capital, basicInfo.alpha2Code);
    generateCurrency(basicInfo.currencies[0].code);
    generateHolidays(basicInfo.alpha2Code);
 }
 
function addInfo(title, data, location, classId){
    $(location).append(`<li class="${classId}">${title} ${data}</li>`);
}

// ====================================================
// ================== General Info ====================
// ====================================================
function generateGeneral(country){
    let url = "https://restcountries.eu/rest/v2/name/" + country +"?fullText=true";
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
    const currency = country.currencies[0];
    addFlag('Flag of '+country.name, country.flag, country.name);
    addInfo('Population: ', country.population.toLocaleString(), location,'population');
    addInfo('Capital City: ', country.capital, location,'capital');
    addInfo('Language: ', country.languages[0].name, location,'language');
    addInfo('Currency: ',currency.name +" ("+currency.code + ") ",location,'money');
    addInfo('Region: ',country.subregion,location,'region');
}



function addFlag(caption, flag, countryName){
    const description = `Flag of ` + countryName;
    
    $('.general-info').append(`<li class="flag-group"><figure><img class="flag" src="${flag}" alt="${description}"><figcaption class="caption">${caption}</figcaption></figure></li>`);
}

// ====================================================
// ================== Weather Info ====================
// ====================================================
function generateWeather(capital, countryCode){
    if (countryCode=='US') capital='Washington, DC';
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
    addInfo('Description: ',weather.weather.description+" in "+weather.city_name,location,'description more-weather');
    addInfo('Feels like: ',weather.app_temp +'\u00B0F',location,'feels-like more-weather');
    addInfo('Sunrise: ',weather.sunrise,location,'sunrise more-weather');
    addInfo('Sunset: ',weather.sunset,location,'sunset more-weather');
    
    //hide additional weather info
    $(".weather-info li:gt(1)").addClass('hidden');
}

function addWeatherIcon(weather){
    $('.weather-info').append(`<li class="weather-icon"><img src="weather-icons/${weather.icon}.png" alt="${weather.description}"></li>`);
}
// ====================================================
// ================== Currency Info ===================
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

    let mainCurr = `<div class="main-curr-group"><p class="main-currency">1 ${keys[0]} </p><img class="arrow" src="images/right-arrow.png" alt="arrow pointing right"></div>`;
    $(mainCurr).insertAfter($(".currency-title"));

    for(let i = 1 ; i < keys.length; i++){
        addInfo(keys[i]+': ',response.rates[keys[i]],'.currency-info','currency-item');
    }
    //hide any currency conversions after the 5th
    $(".currency-info li:gt(4)").addClass('hidden');
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
    for(let i=0; i<holidayList.length; i++){
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
    //hide any holidays after the 10th
    $(".holiday-info li:gt(9)").addClass('hidden');
}

// ====================================================
// ================== Back to Top =====================
// ====================================================
function handleBack(){
    $('.back-txt').on('click', function(event){
        event.preventDefault();
        scrollTo('search');
    });
}

// ====================================================
// ================== More Arrow ======================
// ====================================================
function handleArrow(){
    $('.more').on('click', function(event){
        event.preventDefault();
        let isDown = ($(this).hasClass('down'));
        //show/hide results
        let location = event.currentTarget.id;
        let num=1;
        if(location=='currency') num = 4;
        else if(location=='holiday') num = 9;

        if(!isDown)
            $(`.${location}-info li:gt(${num})`).removeClass('hidden');
        else
            $(`.${location}-info li:gt(${num})`).addClass('hidden');

        //flip arrow
        toggleArrow(this, isDown);
    });
}

function toggleArrow(status, isDown){
    if(isDown) $(status).removeClass('down');
    else $(status).addClass('down');
}

// ====================================================
// ================== Handle Everything ===============
// ====================================================
function handleClicks(){
    handleSubmit();
    handleBack();
    handleArrow();
}

$(handleClicks);