// ==UserScript==
// @name         Selection userscript
// @namespace    mailto:explosionscratch@gmail.com
// @source       https://github.com/Explosion-Scratch/userscripts/blob/main/Easy_Select.user.js
// @downloadURL  https://github.com/Explosion-Scratch/userscripts/raw/main/Easy_Select.user.js
// @updateURL    https://github.com/Explosion-Scratch/userscripts/raw/main/Easy_Select.user.js
// @version      0.1
// @description  Allows you to easily select text. Control + click for the whole element, Control + Shift + click for one word, Shift + Click for one sentence.
// @author       Explosion-Scratch
// @match        *://*/*
// @icon         https://api.iconify.design/bi:cursor-text.svg?color=white
// @grant        none
// ==/UserScript==

(async () => {
    'use strict';
let keys = {};
window.onkeydown = (e) => {
    keys[e.key] = true;
    keys.Alt = e.altKey;
    keys.Control = e.ctrlKey;
    keys.Shift = e.shiftKey;
};
window.onkeyup = (e) => {
    keys.Alt = e.altKey;
    keys.Control = e.ctrlKey;
    keys.Shift = e.shiftKey;
    keys[e.key] = false
};

window.onclick = (e) => {
    console.log(keys);
    let node = e.target
    const selection = window.getSelection();
    let range;
    if (keys.Control && keys.Shift){
        range = word(e.x, e.y, "word");
    } else if (keys.Control && !keys.Shift){
        range = document.createRange();
        range.selectNodeContents(node);
    }else if (keys.Shift){
        range = word(e.x, e.y, "sentence");
    }
    if (range){
        selection.removeAllRanges();
        selection.addRange(range);
    }
}
function word(x, y, mode) {
  var range = document.caretRangeFromPoint(x, y);

  if (range.startContainer.nodeType === Node.TEXT_NODE) {
    range.expand(mode);
    return range;
  }

  return null;
}
})();
