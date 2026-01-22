chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    if (message.action === "NEXT_TAB" || message.action === "PREVIOUS_TAB") {

        const increment = message.action === "NEXT_TAB" ? 1 : -1;

        chrome.tabs.query({ currentWindow: true }, (tabs) => {

            const currentTabIndex = sender.tab.index;

            //Handle tab wrapping
            const nextTabIndex = (currentTabIndex + increment) % tabs.length;

            const nextTab = tabs.find(t => t.index === nextTabIndex);
            if (nextTab) {
                chrome.tabs.update(nextTab.id, { active: true });
            }
        });
    }


    else if (message.action === "CLOSE_TAB") {
        chrome.tabs.query({ currentWindow: true }, (tabs) => {

            const currentTabID = sender.tab.id;
            if (currentTabID) {
                chrome.tabs.remove(currentTabID);
            }
        });
    }

});

