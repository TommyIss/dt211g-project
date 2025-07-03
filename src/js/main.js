"use strict";

// Variabler
let lengthInput = document.getElementById('length');
let weightInput = document.getElementById('weight');
let ageInput = document.getElementById('age');
let maleChoice = document.getElementById('male');
let femaleChoice = document.getElementById('female');
let btnEl = document.getElementById('btn');
let caloricDiv = document.getElementById('caloric-needs');
let macronutrientsDiagram = document.getElementById('macronutrients-diagram');
let vitaminDiagram = document.getElementById('vitamin-diagram');
let mineralsDiagram = document.getElementById('minerals-diagram');
let recommendationDiv = document.getElementById('recommendation');

let isDark = isDarkTheme();
let fontColor = isDark ? 'white': 'black'; 
let themeQuery = window.matchMedia('(prefers-color-scheme: dark)');

themeQuery.addEventListener('change', (e) => {
    isDark = e.matches;
    fontColor = isDark ? 'white': 'black';

    // Uppdatera typsnitt-färg i diagram
    getData();

});

// Eventlyssnare
btnEl.addEventListener('click', function(event){   event.preventDefault();     
    getData();
});

// btnEl.addEventListener('click', function(event){   event.   preventDefault();     
//     printSwedishText(text);
// });

/**
 * Funktion för att översätter response från engelska till Svenska
 */

async function translateToSwedish(text) {
    // Google translate API
    let url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=sv&dt=t&q=${encodeURIComponent(text)}`;
    
    try {
        let response = await fetch(url);
        let data = await response.json();
        // console.log(data[0][0][0]);
        return data[0][0][0];
    } catch(error) {
        console.error('Fel vid översättning');
    }
}

async function printSwedishText(text) {

    try {
        return await translateToSwedish(text);
        
    } catch (err) {
        console.error('Fel vid utskrift:', err);
        return 'Översättning misslyckades';
    }
}

// Funktioner

// Funktion för kontrollera inmatning
function inputCheck() {
    let lengthValue = lengthInput.value;
    let weightValue = weightInput.value;
    let ageValue = ageInput.value;

    let lengthError = document.getElementById('length-error');
    let weightError = document.getElementById('weight-error');
    let ageError = document.getElementById('age-error');
    let genderError = document.getElementById('sex-error');
    
    let isValid = true;
    if(!lengthValue) {
        lengthError.innerHTML = 'Du måste fylla i längden';
        lengthError.style.color = 'red';
        isValid = false;
    } else {
        lengthError.innerHTML = '';
    }

    if(!weightValue) {
        weightError.innerHTML = 'Du måste fylla i vikten';
        weightError.style.color = 'red';
        isValid = false;
    } else {
        weightError.innerHTML = '';
    }
    
    if(!ageValue) {
        ageError.innerHTML = 'Du måste fylla i ålder';
        ageError.style.color = 'red';
        isValid = false;
    } else {
        ageError.innerHTML = '';
    }

    if(!maleChoice.checked && !femaleChoice.checked) {
        genderError.innerHTML = 'Du måste välja Man/kvinna';
        genderError.style.color = 'red';
        isValid = false;
    } else {
        genderError.innerHTML = '';
    }

    
    return isValid;
}


async function getData() {
    if(!inputCheck()) {
        return;
    }
    
    let lengthValue = lengthInput.value;
    let weightValue = weightInput.value;
    
    let url = `https://api.apiverve.com/v1/bmicalculator?weight=${weightValue}&height=${lengthValue}&unit=metric`;

    try {
        let response = await fetch(url, {
            method: 'GET',
            headers: {
                "x-api-key": "83d64081-ad76-49a6-9094-2d3e02ebf442"
            }
        });

        if(!response.ok) {
            throw new Error('Fel vid anslutning till data');
        }
        let data = await response.json();
        
        printAnalys(data.data);
        getNutrition(data.data.bmi);
    
    } catch (error) {
        console.error('Error: ', error);
    }
}

/**
 * Rekommendation beroende på bmi
 */
async function printAnalys(data) {
    recommendationDiv.innerHTML = '';
    
    let dataList = document.createElement('ul');
    let bmiData = document.createElement('li');
    bmiData.textContent = `Din BMI: ${data.bmi}`;

    let riskData = document.createElement('li');
    riskData.textContent = `Risk: ${await printSwedishText(data.risk)}`;
    
    let summaryData = document.createElement('li');
    summaryData.textContent = `Sammanfattning: ${await printSwedishText(data.summary)}`;

    let recommendationData = document.createElement('li');
    recommendationData.textContent = `Rekommendation: ${await printSwedishText(data.recommendation)}`;

    dataList.appendChild(bmiData);
    dataList.appendChild(riskData);
    dataList.appendChild(summaryData);
    dataList.appendChild(recommendationData);

    recommendationDiv.appendChild(dataList);
}

import ApexCharts from "apexcharts";

/**
 * Funktion för att hämta nutration-data
 */
async function getNutrition(bmi) {
    // Rekommenderat aktivitetnivå
    let activityLevel = '';
    if(bmi < 18.5) { activityLevel = 'Inactive';}
    if(bmi >= 18.5 && bmi < 25) { activityLevel = 'Active';}
    if(bmi >= 25 && bmi < 30) { activityLevel = 'Low Active';}
    if(bmi >= 30) { activityLevel = 'Very Active';}
    
    let lengthValue = lengthInput.value;
    let weightValue = weightInput.value;
    let ageValue = ageInput.value;
    let genderChoice = '';

    // If-sats för att kontrollera man eller kvinna
    if(maleChoice.checked) {
        genderChoice = 'male';
    } else if(femaleChoice.checked) {
        genderChoice = 'female';
    }
    // API-länk
    let url = `https://nutrition-calculator.p.rapidapi.com/api/nutrition-info?measurement_units=met&sex=${genderChoice}&age_value=${ageValue}&age_type=yrs&cm=${lengthValue}&kilos=${weightValue}&activity_level=${activityLevel}`

    try {
        let response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': '841b9b9cc7msha4c8304c266a29fp1aa6ffjsnd6a78fb814cd',
                'X-RapidAPI-Host': 'nutrition-calculator.p.rapidapi.com'
            }
        });
        
        if(!response.ok) {
            throw new Error('Fel vid anslutning till näringsApi');
        }

        let data = await response.json();

        
        printCloricsNeed(data.BMI_EER);


        let protein = data.macronutrients_table['macronutrients-table'].find(item => item[0] === 'Protein');
        let carbs = data.macronutrients_table['macronutrients-table'].find(item => item[0] === 'Carbohydrate');
        let fat = data.macronutrients_table['macronutrients-table'].find(item => item[0] === 'Fat');
        let fibers = data.macronutrients_table['macronutrients-table'].find(item => item[0] === 'Total Fiber');

        printMacronutrientsDiagram(protein, carbs, fat, fibers);
        
        
        
        // Vitaminer
        let vitaminA = data.vitamins_table['vitamins-table'].find(item => item[0] === 'Vitamin A');
        let vitaminC = data.vitamins_table['vitamins-table'].find(item => item[0] === 'Vitamin C');
        let vitaminD = data.vitamins_table['vitamins-table'].find(item => item[0] === 'Vitamin D');
        let vitaminB6 = data.vitamins_table['vitamins-table'].find(item => item[0] === 'Vitamin B6');
        let vitaminB12 =data.vitamins_table['vitamins-table'].find(item => item[0] === 'Vitamin B12');
        
        
        printVitaminsDiagram(vitaminA, vitaminC, vitaminD, vitaminB6, vitaminB12);
        
        // Mineraler
        let calcium = data.minerals_table['essential-minerals-table'].find(item => item[0] === 'Calcium');
        let iron = data.minerals_table['essential-minerals-table'].find(item => item[0] === 'Iron');
        let magnesuim = data.minerals_table['essential-minerals-table'].find(item => item[0] === 'Magnesium');
        let zinc = data.minerals_table['essential-minerals-table'].find(item => item[0] === 'Zinc');
        let potassium = data.minerals_table['essential-minerals-table'].find(item => item[0] === 'Potassium');
         
        printMineralsDiagram(calcium, iron, magnesuim, zinc, potassium);

    } catch (error) {
        console.error('Error: ' + error);
    }
}

// Funktion för kaloribehov
async function printCloricsNeed(data) {
    caloricDiv.innerHTML = '';

    let caloryTitle = document.createElement('h3');
    caloryTitle.textContent = 'Ditt dagliga kaloribehov';

    let caloricParagraph = document.createElement('p');
    caloricParagraph.textContent = await printSwedishText(data['Estimated Daily Caloric Needs']);
    
    caloricDiv.appendChild(caloryTitle);
    caloricDiv.appendChild(caloricParagraph);
}

function reRenderCharts() {
    printMacronutrientsDiagram(protein, carbs, fat, fibers);
    printVitaminsDiagram(vitaminA, vitaminC, vitaminD, vitaminB6, vitaminB12);
    printMineralsDiagram(calcium, iron, magnesuim, zinc, potassium);
}
// // Funktion för att skapa diagram rekommenderade näringsinnehåll
async function printMacronutrientsDiagram(protein, carbs, fat, fibers) {

    macronutrientsDiagram.innerHTML = '';

    let proteinValue = parseFloat(protein[1].split(' ')[0]);
    let carbsValue = parseFloat(carbs[1].split(' ')[0]);
    let fatValue = parseFloat(fat[1].split(' ')[0]);
    let fibersValue = parseFloat(fibers[1].split(' ')[0]);
    
    

    let options = {
        chart: {
            type: 'pie',
            height: '500px',
            width: '100%'
        },
        title: {
            text: 'Dagligt Näringsbehöv',
            align: 'center',
            style: {
                fontSize: '18px',
                fontWeight: 'bold',
                color: fontColor
            }
        },
        series: [
            proteinValue,
            carbsValue,
            fatValue,
            fibersValue
        ],
        labels: [
            `${await printSwedishText(protein[0])}, ${proteinValue}g`,
            `${await printSwedishText (carbs[0])}, ${carbsValue}g`,
            `${await printSwedishText (fat[0])}, ${fatValue}g`,
            `${await printSwedishText (fibers[0])}, ${fibersValue}g`
        ],
        dataLabels: {
            enabled: true,
            style: {
                fontSize: '0.8em',
                foreColor: fontColor
            }
        },
        legend: {
            labels: {
                colors: fontColor
            }
        },
        fill: {
            colors: ['red', 'green', 'blue', 'yellow']
        },
        animations: {
            enabled: true,
            easing: 'easeinout',
            speed: 3000
        }
    }

    let chart = new ApexCharts(macronutrientsDiagram, options);
    chart.render();
}

// Funktion för att skapa diagram för rekommenderade vitaminer
async function printVitaminsDiagram(vitaminA, vitaminC, vitaminD, vitaminB6, vitaminB12) {

    vitaminDiagram.innerHTML = '';

    let vitaminAValue = parseFloat(vitaminA[1].split(' ')[0]) / 1000; // För omvandla till mg
    let vitaminCValue = parseFloat(vitaminC[1].split(' ')[0]);
    let vitaminDValue = parseFloat(vitaminD[1].split(' ')[0]) / 1000;
    let vitaminB6Value = parseFloat(vitaminB6[1].split(' ')[0]);
    let vitaminB12Value = parseFloat(vitaminB12[1].split(' ')[0]) / 1000;

   
    let options = {
        chart: {
            type: 'donut',
            height: '500px',
            width: '100%'
        },
        title: {
            text: 'Dagligt Vitaminintag',
            align: 'center',
            style: {
                fontSize: '18px',
                fontWeight: 'bold',
                color: fontColor
            }
        },
        series: [
            vitaminAValue,
            vitaminCValue,
            vitaminDValue,
            vitaminB6Value,
            vitaminB12Value
        ],
        labels: [
            `${await printSwedishText(vitaminA[0])}, ${vitaminAValue}mg`,
            `${await printSwedishText(vitaminC[0])}, ${vitaminCValue}mg`,
            `${await printSwedishText(vitaminD[0])}, ${vitaminDValue}mg`,
            `${await printSwedishText(vitaminB6[0])}, ${vitaminB6Value}mg`,
            `${await printSwedishText(vitaminB12[0])}, ${vitaminB12Value}mg`
        ],
        dataLabels: {
            style: {
                fontSize: '0.8em',
                foreColor: fontColor
            }
        },
        legend: {
            position: 'top',
            labels: {
                colors: fontColor
            }
        },
        colors: ['aqua' , 'crimson', 'yellow', 'green', 'orange'],
        animations: {
            enabled: true,
            easing: 'easeinout',
            speed: 3000
        }
    };

    let chart = new ApexCharts(vitaminDiagram, options);

    chart.render();
}

// Funktion för att skapa diagram rekommenderade mineraler
async function printMineralsDiagram(calcium, iron, magnesuim, zinc, potassium) {

    mineralsDiagram.innerHTML = '';

    let calciumValue = parseFloat(calcium[1].split(' ')[0]);
    let ironValue = parseFloat(iron[1].split(' ')[0]);
    let magnesuimValue = parseFloat(magnesuim[1].split(' ')[0]);
    let zincValue = parseFloat(zinc[1].split(' ')[0]);
    let potassiumValue = parseFloat(potassium[1].split(' ')[0]);


    let options = {
        chart: {
            type: 'bar',
            height: '400px',
            weight: '100%'
        },
        title: {
            text: 'Mineralers behov',
            align: 'center',
            style: {
                fontSize: '18px',
                fontWeight: 'bold',
                color: fontColor
            }
        },
        series: [
            {
                name: 'Mineraler',
                data: [
                    calciumValue,
                    ironValue,
                    magnesuimValue,
                    zincValue,
                    potassiumValue
                ],
                style: {
                    fontSize: '0.8em',
                    fontWeight: 'bold',
                    foreColor: fontColor
                }
            }
        ],
        xaxis: {
            categories: [
                `${await printSwedishText(calcium[0])}, ${calciumValue}mg`,
                `${await printSwedishText(iron[0])}, ${ironValue}mg`,
                `${await printSwedishText(magnesuim[0])}, ${magnesuimValue}mg`,
                `${await printSwedishText(zinc[0])}, ${zincValue}mg`,
                `${await printSwedishText(potassium[0])}, ${potassiumValue}mg`
            ],
            labels: {
                style: {
                    fontSize: '0.8em',
                    colors: fontColor
                }
            }
        },
        fill: {
            colors: ['blue']
        },
        animations: {
            enabled: true,
            easing: 'easeinout',
            speed: 3000
        }
    }

    let chart = new ApexCharts(mineralsDiagram, options);
    chart.render();
}

/**
 * Funktion för att kontrollera om temat är mörkt
 */
function isDarkTheme() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}




