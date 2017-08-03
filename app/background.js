"use strict;"

chrome.browserAction.onClicked.addListener(openNewTab);
chrome.tabs.onCreated.addListener(openApp);

function openNewTab() {
    let tabProperties = {
        url: "index.html"
    }
    chrome.tabs.create(tabProperties);
}

function openApp() {
    let updateProperties = {
        url: "index.html"
	}
	let tabProperties = {
		currentWindow: true, 
		active : true
	}
	function checkIfNewTab(tabData) {
		let url = tabData[0].url;
		if (url === "chrome://newtab/") {
			chrome.tabs.update(updateProperties)
			window.history.replaceState({} , "", " ");
		}
	}
	chrome.tabs.query(tabProperties, function(data){
		checkIfNewTab(data); //Direct call doesn't work
	})
}
