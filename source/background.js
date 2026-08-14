chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    if (message.action === "NEXT_TAB" || message.action === "PREVIOUS_TAB") {

        const increment = message.action === "NEXT_TAB" ? 1 : -1;

        chrome.tabs.query({ currentWindow: true }, (tabs) => {

            const currentTabIndex = sender.tab.index;

            //Handle tab wrapping
            //TODO - This doesn't wrap going backwards
            //TODO - Going tab index 0 to last tab will fail
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
                //TODO Remove this tab from the 'recentTabs' storage
                chrome.tabs.remove(currentTabID);
            }
        });
    }

    else if (message.action === "OPEN_YT") {
        chrome.tabs.query({ currentWindow: true }, (tabs) => {

            chrome.tabs.query({ url: "*://*.music.youtube.com/*" }, (tabs) => {
                if (tabs.length > 0) {
                    chrome.tabs.update(tabs[0].id, { active: true });
                } else {
                    console.log("No matching tabs found.");
                }
            });
        });
    }

    else if (message.action === "OPEN_TAB" && message.tabId) {

        const targetTabId = parseInt(message.tabId, 10);
        chrome.tabs.update(targetTabId, { active: true });

        //chrome.tabs.update(tabs[0].id, { active: true });



    }
    else if (message.action === "RESTORE_TAB") {
        chrome.sessions.restore();
    }

});

chrome.tabs.onActivated.addListener((activeInfo) => {
    const tabId = activeInfo.tabId;
    chrome.storage.local.get(['recentTabs'], (result) => {
        let stack = result.recentTabs || [];

        try {
            chrome.tabs.get(activeInfo.tabId, (tab) => {
                const tabName = tab.title;
                const shortTabName = tabName.length > 20 ? (tabName.slice(0, 20) + '...') : tabName

                //filter out old instances of tab in stack and put itt at the front
                stack = [{ tabId: tabId, tabName: shortTabName }, ...stack.filter(tab => tab.tabId !== tabId)];

                //Stack limit of 15
                chrome.storage.local.set({ recentTabs: stack.slice(0, 15) });
            });
        } catch (error) {
            console.error("Error retrieving tab info:", error);
        }

    });
});

chrome.tabs.onRemoved.addListener((removeInfo) => {
    const tabId = removeInfo.tabId;
    chrome.storage.local.get(['recentTabs'], (result) => {
        let stack = result.recentTabs || [];

        try {
            // Remove the tab from the recent tabs array
            stack = [...stack.filter(tab => tab.tabId !== tabId)];
            chrome.storage.local.set({ recentTabs: stack.slice(0, 15) });

        } catch (error) {
            console.error("Error retrieving tab info:", error);
        }

    });
});