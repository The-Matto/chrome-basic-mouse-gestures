console.log("Registered Matto Gestures");

let startMousePos;

const gestureActivateThreshold = 100.;
const gestureOtherAxisAllowance = 20.;

//Start mouse gesture
document.addEventListener('mousedown', (event) => {
    if (event.button === 2) {

        startMousePos = { x: event.x, y: event.y };

    }
});

//Complete gesture
document.addEventListener('contextmenu', (event) => {

    const endMousePos = { x: event.x, y: event.y };

    const normalisedMouseX = startMousePos.x - endMousePos.x;
    const normalisedMouseY = startMousePos.y - endMousePos.y;

    // Reload page
    if (normalisedMouseY < -gestureActivateThreshold
        && Math.abs(normalisedMouseX) < gestureOtherAxisAllowance) {

        console.log("Matto - Reload Page");

        event.preventDefault();
        location.reload()

        return;
    }

    // Close tab
    if (normalisedMouseY > gestureActivateThreshold
        && Math.abs(normalisedMouseX) < gestureOtherAxisAllowance) {

        console.log("Matto - Close Tab");

        event.preventDefault();
        chrome.runtime.sendMessage({ action: "CLOSE_TAB" });
        return;
    }

    // Next tab
    if (normalisedMouseX < -gestureActivateThreshold
        && Math.abs(normalisedMouseY) < gestureOtherAxisAllowance) {

        console.log("Matto - Next Tab");

        event.preventDefault();
        chrome.runtime.sendMessage({ action: "NEXT_TAB" });
        return;
    }

    // Previous Tab
    if (normalisedMouseX > gestureActivateThreshold
        && Math.abs(normalisedMouseY) < gestureOtherAxisAllowance) {

        console.log("Matto - Previous Tab");

        event.preventDefault();
        chrome.runtime.sendMessage({ action: "PREVIOUS_TAB" });
        return;
    }
}, true);

