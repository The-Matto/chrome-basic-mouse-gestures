

const Directions = {
    FARUP: {
        actionName: "Restore Tab",
        calculateDirection: ({ x, y }) => {
            return (y > +gestureActivateThreshold + farActivator
                && Math.abs(x) < gestureOtherAxisAllowance);
        },
        activate: () => {
            console.log("Matto - Restore Tab");
            chrome.runtime.sendMessage({ action: "RESTORE_TAB" });
            return true;
        },

    },
    UP: {
        actionName: "Close Tab",
        calculateDirection: ({ x, y }) => {
            return (y > gestureActivateThreshold && y < (+gestureActivateThreshold + farActivator)
                && Math.abs(x) < gestureOtherAxisAllowance);
        },
        activate: () => {
            console.log("Matto - Close Tab");
            chrome.runtime.sendMessage({ action: "CLOSE_TAB" });
            return true;
        },

    },

    DOWN: {
        actionName: "Refresh Tab",
        calculateDirection: ({ x, y }) => {
            return (y < -gestureActivateThreshold
                && Math.abs(x) < gestureOtherAxisAllowance)
        },

        activate: () => {
            console.log("Matto - Reload Page");
            location.reload()
            return true;
        },
    },

    RIGHT: {
        actionName: "Next Tab",
        calculateDirection: ({ x, y }) => {
            return (x < -gestureActivateThreshold
                && Math.abs(y) < gestureOtherAxisAllowance);
        },
        activate: () => {
            console.log("Matto - Next Tab");
            chrome.runtime.sendMessage({ action: "NEXT_TAB" });
            return true;
        },

    },

    LEFT: {
        actionName: "Previous Tab",
        calculateDirection: ({ x, y }) => {
            return (x > gestureActivateThreshold
                && Math.abs(y) < gestureOtherAxisAllowance);
        },
        activate: () => {
            console.log("Matto - Previous Tab");
            chrome.runtime.sendMessage({ action: "PREVIOUS_TAB" });
            return true;
        },

    },


    CANCEL: {
        actionName: "Cancel",
        calculateDirection: ({ x, y }) => {
            const vectorLength = Math.abs(y) + Math.abs(x);
            return vectorLength > 20 || isGesturing;
        },
        activate: () => {
            console.log("Matto - Cancel");
            return true;
        },

    },
}

let createdWidget;
let overlayText = null;
let overlayDiv = null;
let overlayRecentTabs = null;
let shadowRoot = null;
let activeHoveredItem = null;

const overlayWidget = {

    createWidget: async () => {
        const { x, y } = startMousePos;

        //TODO Fix this magic number
        const posY = y - 40;
        const posX = x - (widgetWidth / 2);

        //Only allowing one instance of the overlay widget
        if (createdWidget) {

            overlayDiv.style.top = posY + "px";
            overlayDiv.style.left = posX + "px";

            overlayWidget.setShowOverlay(false);
            return;
        }

        createdWidget = document.createElement('div');

        const htmlUrl = chrome.runtime.getURL("source/overlayWidget.html");
        const response = await fetch(htmlUrl);
        const htmlText = await response.text();

        createdWidget.innerHTML = htmlText;

        overlayWidget.setShowOverlay(false);

        const host = document.createElement('div');
        host.id = 'my-extension-root';
        host.style.display = 'block';
        host.style.position = 'none';
        document.body.appendChild(host);

        shadowRoot = host.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(createdWidget);

        overlayText = shadowRoot.getElementById("overlay-text");
        overlayDiv = shadowRoot.getElementById("overlay");
        overlayTestDiv = shadowRoot.getElementById("overlay-test");
        overlayRecentTabs = shadowRoot.getElementById("recent-tabs-list");

        overlayWidget.addRecentTabs()



        overlayDiv.style.top = posY + "px";
        overlayDiv.style.left = posX + "px";

    },
    addRecentTabs: async () => {

        //TODO - Disabled this until I make tabs
        return;

        const template = shadowRoot.getElementById('template-list-item');

        chrome.storage.local.get(['recentTabs'], (result) => {
            if (result.recentTabs) {
                //Start at elem 1 to skip the active tab
                for (let i = 1; i <= 5; i++) {

                    const tab = result.recentTabs[i];

                    if (!tab)
                        return;

                    //TODO Load storage of recent tabs, loop them
                    const node = template.content.cloneNode(true);
                    const rootElement = node.firstElementChild;
                    rootElement.id = 'recent-tab-' + tab.tabId;
                    rootElement.dataset.tabId = tab.tabId;
                    const textElem = node.firstElementChild;

                    overlayRecentTabs.appendChild(rootElement);
                   
                    textElem.textContent = tab.tabName;



                    rootElement.addEventListener('pointerenter', (e) => {
                        console.log("Mouse ENTER");
                        const tabId = e.currentTarget.dataset.tabId;
                        activeHoveredItem = tabId;


                    });
                    rootElement.addEventListener('pointerleave', (e) => {
                        activeHoveredItem = null;

                        console.log("Mouse LEAVE");
                    });

                }
            }
        });



    },

    setWidgetText: async (inText) => {
        if (createdWidget && overlayText) {
            overlayText.textContent = inText;
        }
    },

    setShowOverlay: (shouldShow) => {
        if (createdWidget) {
            createdWidget.style.display = shouldShow ? 'block' : 'none';
        }
    }
}


console.log("Registered Matto Gestures");


//TODO Clean these vars up
let startMousePos;

let gestureActivateThreshold = 100;
let gestureOtherAxisAllowance = 20;
const farActivator = 100;

let isHoldingMouseTwo = false;

let widgetOverlay;
const widgetWidth = 150;

let isThrottled = false;

let isGesturing = false;

// ~


//Get user settings from storage
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

        isGesturing = false;
        isHoldingMouseTwo = true;
        startMousePos = { x: event.x, y: event.y };
        overlayWidget.createWidget();
    }
});


//Start mouse gesture
document.addEventListener('mousemove', (event) => {

    if (!isThrottled && isHoldingMouseTwo) {

        isThrottled = true;

        let strText = "None";

        const normalisedMouseX = startMousePos.x - event.x;
        const normalisedMouseY = startMousePos.y - event.y;

        const activeLogic = Object.values(Directions).find(item =>
            item.calculateDirection({ x: normalisedMouseX, y: normalisedMouseY }));

        if (activeLogic) {
            strText = activeLogic.actionName;

            if (activeLogic === Directions.CANCEL) {
                if (!isGesturing)
                    overlayWidget.setShowOverlay(true);

                isGesturing = true;
            }
        }

        overlayWidget.setWidgetText(strText);


        setTimeout(() => {
            isThrottled = false;
        }, 50);
    }

});

//Complete gesture
document.addEventListener('contextmenu', (event) => {

    isHoldingMouseTwo = false;
    overlayWidget.setShowOverlay(false);

    const normalisedMouseX = startMousePos.x - event.x;
    const normalisedMouseY = startMousePos.y - event.y;

    if (activeHoveredItem) {
        event.preventDefault();
        chrome.runtime.sendMessage({ action: "OPEN_TAB", tabId: activeHoveredItem });
        return;
    }
    const activeLogic = Object.values(Directions).find(direction =>
        direction.calculateDirection({ x: normalisedMouseX, y: normalisedMouseY }));

    if (activeLogic) {
        activeLogic.activate()
        event.preventDefault();
    }
}, true);

