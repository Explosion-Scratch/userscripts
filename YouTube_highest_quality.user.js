// ==UserScript==
// @name         YouTube highest quality
// @namespace    mailto:explosionscratch@gmail.com
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    let prevQuality = null;
    console.log('YouTube highest quality running');
    setInterval(async () => {
        let player = document.getElementById('movie_player') || document.querySelector('.html5-video-player')
        if (!player){return}
        let quality = player.getPlaybackQualityLabel();
        if (quality == prevQuality){return};
        prevQuality = quality;
        document.querySelector('.ytp-settings-button').click()
        await tick();
        [...document.querySelectorAll('.ytp-menuitem')].find(i => i.innerText.includes('Quality')).click()
        await tick();
        [...document.querySelectorAll('.ytp-menuitem')].filter(i => !i.innerText.includes('Premium')).find(i => i.innerText.includes('HD') || i.innerText.includes('4K') || i.innerText.includes('2K')).click()


        function tick(){
            return new Promise(r => setTimeout(r));
        }
    }, 100)
})();
