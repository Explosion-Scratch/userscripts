// ==UserScript==
// @name         Minify code
// @namespace    mailto:explosionscratch@gmail.com
// @version      0.1
// @description  Minify code via context menu (with Terser)
// @author       Explosion-Scratch
// @match        *://*/*
// @icon         https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://terser.org&size=64
// @grant        none
// @run-at       context-menu
// @source       https://github.com/Explosion-Scratch/userscripts/blob/main/minify.user.js
// @updateURL    https://github.com/Explosion-Scratch/userscripts/raw/main/minify.user.js
// @require      https://cdn.jsdelivr.net/npm/terser/dist/bundle.min.js
// ==/UserScript==

(async function() {
    'use strict';
    let _selected;
    if (!selected()) {
        _selected = prompt("What code would you like to use?");
    }
    if (!selected()){
       return;
    }

    replace((await Terser.minify(selected())).code);

    function selected() {
        return _selected || window.getSelection().toString();
    }
    function replace(replacementText) {
    console.log(document.activeElement.tagName);
    if (document.activeElement.getAttribute("contenteditable") !== null) {
      var sel, range;
      if (window.getSelection) {
        sel = window.getSelection();
        if (sel.rangeCount) {
          range = sel.getRangeAt(0);
          range.deleteContents();
          range.insertNode(document.createTextNode(replacementText));
        }
      } else if (document.selection && document.selection.createRange) {
        range = document.selection.createRange();
        range.text = replacementText;
      }
    } else if (
      ["TEXTAREA", "INPUT"].includes(document.activeElement.tagName) &&
      [false, null, undefined].includes(
        document.activeElement.getAttribute("readonly")
      )
    ) {
      var txtArea = document.activeElement;
      if (txtArea.selectionStart != undefined) {
        var startPos = txtArea.selectionStart;
        var endPos = txtArea.selectionEnd;
        //selectedText = txtArea.value.substring(startPos, endPos);
        txtArea.value =
          txtArea.value.slice(0, startPos) +
          replacementText +
          txtArea.value.slice(endPos);
      }
    } else {
      const e = document.createElement("textarea");
      (e.value = replacementText),
        document.body.appendChild(e),
        e.select(),
        document.execCommand("copy"),
        e.remove();
      prompt(
        `Minified your code, and copied it to the clipboard`, replacementText
      );
    }
  }
})();