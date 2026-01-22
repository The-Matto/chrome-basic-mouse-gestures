

console.log("Registered Matto Gestures");

let startMousePos;

let gestureActivateThreshold = 100;
let gestureOtherAxisAllowance = 20;

let isTryingGesture = false;

const Direction = Object.freeze({
    UP: 'UP',
    DOWN: 'DOWN',
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
    NONE: 'NONE'
});

let widgetOverlay;

chrome.storage.sync.get(['config'], (result) => {
    if (result.config) {
        gestureActivateThreshold = result.config.activateValue;

        //TODO Add the allowance
        gestureOtherAxisAllowance = 20; //result.config.allowanceValue;
    }
});


//Start mouse gesture
document.addEventListener('mousedown', (event) => {
    if (event.button === 2) {
        isTryingGesture = true;
        startMousePos = { x: event.x, y: event.y };
        CreateWidget(startMousePos, "Hello");
    }
});

let isThrottled = false;

//Start mouse gesture
document.addEventListener('mousemove', (event) => {


    if (isThrottled || !isTryingGesture) return;

    //isThrottled = true;

    const dir = calculateGesture({ x: event.x, y: event.y });
    console.log(dir);

    let strText = "None";
    switch (dir) {
        case Direction.UP: {
            strText = "Close Tab";
            break;
        }
        case Direction.DOWN: {
            strText = "Refresh Tab";
            break;
        }
        case Direction.RIGHT: {
            strText = "Next Tab";
            break;
        }
        case Direction.LEFT: {
            strText = "Previous Tab";
            break;
        }
    }
    SetWidgetText(strText);


    setTimeout(() => {
        isThrottled = false;
    }, 200);

});

//Complete gesture
document.addEventListener('contextmenu', (event) => {

    isTryingGesture = false;
    const endMousePos = { x: event.x, y: event.y };
    HideWidet();

    const dir = calculateGesture(endMousePos);
    switch (dir) {
        case Direction.UP:
            {
                // Close tab
                console.log("Matto - Close Tab");

                event.preventDefault();
                chrome.runtime.sendMessage({ action: "CLOSE_TAB" });
                return;
            }
        case Direction.DOWN:
            {
                // Reload page
                console.log("Matto - Reload Page");

                event.preventDefault();
                location.reload()
                return;
            }
        case Direction.RIGHT:
            {
                // Next tab
                console.log("Matto - Next Tab");

                event.preventDefault();
                chrome.runtime.sendMessage({ action: "NEXT_TAB" });
                return;
            }
        case Direction.LEFT:
            {
                // Previous Tab
                console.log("Matto - Previous Tab");

                event.preventDefault();
                chrome.runtime.sendMessage({ action: "PREVIOUS_TAB" });
                return;
            }
    }


}, true);


// Widget Overlay

CreateWidget = (offset, triggeredAction) => {

    const { x, y } = startMousePos;

    //TODO Instead of recreating this, we should just reuse the same object!
    widgetOverlay = document.createElement('div');


    //TODO Offset the position to be above the mouse!
    widgetOverlay.style.position = 'fixed';
    widgetOverlay.style.top = y + "px";
    widgetOverlay.style.left = x + "px";

    widgetOverlay.style.zIndex = '5000';
    widgetOverlay.style.width = 'auto';
    widgetOverlay.style.height = 'auto';
    widgetOverlay.style.backgroundColor = 'black';
    widgetOverlay.style.color = 'white';
    widgetOverlay.style.padding = '8px';

    widgetOverlay.textContent = 'Viewport Coordinate:' + x + ', ' + y;

    document.documentElement.appendChild(widgetOverlay);
}

SetWidgetText = (inText) => {
    if (widgetOverlay) {
        widgetOverlay.textContent = inText;
    }
}

HideWidet = () => {
    if (widgetOverlay) {

        const hideWidget = (widgetInstance) => {
            widgetInstance.style.display = 'none';
        };

        setTimeout(hideWidget, 500, widgetOverlay);
    }
}


// Directions

const calculateGesture = (endMousePos) => {

    const normalisedMouseX = startMousePos.x - endMousePos.x;
    const normalisedMouseY = startMousePos.y - endMousePos.y;

    // Reload page
    if (normalisedMouseY < -gestureActivateThreshold
        && Math.abs(normalisedMouseX) < gestureOtherAxisAllowance) {

        return Direction.DOWN;
    }

    // Close tab
    if (normalisedMouseY > gestureActivateThreshold
        && Math.abs(normalisedMouseX) < gestureOtherAxisAllowance) {

        return Direction.UP;
    }

    // Next tab
    if (normalisedMouseX < -gestureActivateThreshold
        && Math.abs(normalisedMouseY) < gestureOtherAxisAllowance) {
        return Direction.RIGHT;
    }

    // Previous Tab
    if (normalisedMouseX > gestureActivateThreshold
        && Math.abs(normalisedMouseY) < gestureOtherAxisAllowance) {
        return Direction.LEFT;
    }

    return Direction.NONE;
}