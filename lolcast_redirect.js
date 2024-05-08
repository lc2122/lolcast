// ==UserScript==
// @name         추야방용
// @namespace    추야방용
// @version      0.1
// @description  직링 리디렉션기능
// @author       You
// @match        https://insagirl-toto.appspot.com/chatting/lgic/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Function to change the href of YouTube links
    var changeLinks = function() {
        var anchors = document.getElementsByTagName('a');

        for (var i = 0; i < anchors.length; i++) {
            var anchor = anchors[i];

            if (anchor.href.includes('https://youtu.be/')) {
                var videoId = anchor.href.split('https://youtu.be/')[1];
                anchor.href = 'https://lolcast.kr/#/player/youtube/' + videoId;
            }
        }
    };

    // Create a MutationObserver to watch for changes in the DOM
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                changeLinks();
            }
        });
    });

    // Start observing the document with the configured parameters
    observer.observe(document.body, { childList: true, subtree: true });
})();
