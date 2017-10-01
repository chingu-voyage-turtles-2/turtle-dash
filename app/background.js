"use strict;";

/* globals chrome */

chrome.browserAction.onClicked.addListener( openNewTab );
chrome.tabs.onCreated.addListener( openApp );

function openNewTab() {
    const tabProperties = {
        url: "index.html",
    };
    chrome.tabs.create( tabProperties );
}

function openApp() {
    const updateProperties = {
        url: "index.html",
    },
    tabProperties = {
        currentWindow: true,
        active       : true,
    };
    function checkIfNewTab( tabData ) {
        const url = tabData[0].url;
        if ( url === "chrome://newtab/" ) {
            chrome.tabs.update( updateProperties );
            window.history.replaceState( {}, "", " " );
        }
    }
    chrome.tabs.query( tabProperties, ( data ) => {
        checkIfNewTab( data ); // Direct call doesn't work
    } );
}
