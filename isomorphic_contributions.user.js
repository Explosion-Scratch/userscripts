// ==UserScript==
// @name         GitHub Isomorphic contributions
// @namespace    mailto:explosionscratch@gmail.com
// @source       https://github.com/Explosion-Scratch/userscripts/blob/main/isomorphic_contributions.user.js
// @updateURL    https://github.com/Explosion-Scratch/userscripts/blob/main/isomorphic_contributions.user.js
// @require      https://rawcdn.githack.com/jasonlong/isometric-contributions/0176750dc4d7eda26e301c1d81812a5424f167af/src/obelisk.min.js
// @require      https://rawcdn.githack.com/jasonlong/isometric-contributions/0176750dc4d7eda26e301c1d81812a5424f167af/src/iso.js
// @version      0.1
// @description  try to take over the world!
// @author       Explosion-Scratch
// @match        https://github.com/*
// @icon         https://icons.duckduckgo.com/ip2/github.com.ico
// @grant        none
// ==/UserScript==

/* ALL CREDIT TO https://github.com/jasonlong/isometric-contributions, I PORTED TO A USERSCRIPT */
function addGlobalStyle(css) {
    var head, style;
    head = document.getElementsByTagName('head')[0];
    if (!head) { return; }
    style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css.replace(/;/g, ' !important;');
    head.appendChild(style);
}

addGlobalStyle(`.ic-squares #isometric-contributions,
.ic-squares .ic-contributions-wrapper {
  display: none;
}

/* Isometric cube display */
.ic-cubes .contrib-details {
  display: none;
}

.ic-cubes .js-calendar-graph {
  display: none ! important;
}`);
