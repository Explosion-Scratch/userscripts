// ==UserScript==
// @name         Save YouTube Time
// @namespace    mailto:explosionscratch@gmail.com
// @source       https://github.com/Explosion-Scratch/userscripts/blob/main/YouTube_time.user.js
// @updateURL    https://github.com/Explosion-Scratch/userscripts/blob/raw/main/YouTube_time.user.js
// @downloadURL  https://github.com/Explosion-Scratch/userscripts/blob/raw/main/YouTube_time.user.js
// @version      0.1
// @description  try to take over the world!
// @author       Explosion-Scratch
// @match        https://*.youtube.com/*
// @icon         https://icons.duckduckgo.com/ip2/youtube.com.ico
// @grant        none
// ==/UserScript==

(async () => {
    'use strict';
    const $ = (a) => document.querySelector(a);
    let set = {};
    console.log("Save YouTube time running");
    setInterval(() => {
        let id = new URLSearchParams(location.search).get("v");
        if (!$("video") || !id){return console.log("No ID or vid")};
        if (localStorage.getItem(id) && !set[id]){
            //Important to not return if < 10 because then it skips setting
            if (+localStorage.getItem(id) > 10){
                $("video").currentTime = localStorage.getItem(id);
                console.log("Set to ", localStorage.getItem(id));
                set[id]= true;
            }
        }
        if ((set[id] || !localStorage.getItem(id)) && $("video").currentTime > 10){localStorage.setItem(id, $("video").currentTime);console.log(set)}
    }, 1000)
})();
