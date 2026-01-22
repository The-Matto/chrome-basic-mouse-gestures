const activateRangeElem = document.getElementById('activate-value');
const numberElem = document.getElementById('activateRange-value');

let currentActivateValue = 100;
let currentAllowanceValue = 20;

activateRangeElem.addEventListener('input', (e) => {

    currentActivateValue = e.target.value;
    numberElem.innerText = currentActivateValue;
    console.log("UPDATE VALUE");

    const settings = { activateValue: currentActivateValue, allowanceValue: currentAllowanceValue };

    chrome.storage.sync.set({ config: settings });

});

chrome.storage.sync.get(['config'], (result) => {
    if (result.config) {
        activateRangeElem.value = result.config.activateValue;
        numberElem.innerText = result.config.activateValue;
        
        //gestureOtherAxisAllowance = result.config.allowanceValue;
    }
});

window.addEventListener('unload', () => {

    const settings = { activateValue: currentActivateValue, allowanceValue: currentAllowanceValue };

    chrome.storage.sync.set({ config: settings }, () => {
        console.log('Settings saved');
    });
});