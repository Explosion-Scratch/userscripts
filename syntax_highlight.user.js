// ==UserScript==
// @name         Syntax highlighting
// @namespace    mailto:explosionscratch@gmail.com
// @version      0.1
// @description  Syntax highlight raw code and add a copy button
// @author       Explosion-Scratch
// @match        *://*/*.js$
// @match        *://*/*.css$
// @match        *://*/*.ts$
// @match        *://*/*.html$
// @exclude        *://*/*.min.*$
// @icon         https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&size=64&url=https://highlightjs.org/
// @require      https://unpkg.com/@highlightjs/cdn-assets@11.4.0/highlight.min.js
// @resource     hljs_style https://unpkg.com/@highlightjs/cdn-assets@11.4.0/styles/default.min.css
// @grant        GM_getResourceText
// @source       https://github.com/Explosion-Scratch/userscripts/blob/main/syntax_highlight.user.js
// @updateURL    https://github.com/Explosion-Scratch/userscripts/raw/main/syntax_highlight.user.js
// @run-at       document-end
// ==/UserScript==

(function() {
    //Prevent it from applying to normal pages
    if (document.contentType === "text/html"){return}
    'use strict';

    let s = document.createElement("style");
    s.innerText = GM_getResourceText("hljs_style");
    document.head.appendChild(s);


    hljs.highlightElement(document.querySelector("pre"));
    document.querySelector("body").style.margin = 0;
    document.querySelector("pre").style.padding = `20px`;
    document.querySelector("pre").style.margin = 0;
    addCopy("pre");
    function addCopy(el){
    let copyIcon =  `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--carbon" width="20" height="20" preserveAspectRatio="xMidYMid meet" viewBox="0 0 32 32"><path d="M28 10v18H10V10h18m0-2H10a2 2 0 0 0-2 2v18a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2z" fill="currentColor"></path><path d="M4 18H2V4a2 2 0 0 1 2-2h14v2H4z" fill="currentColor"></path></svg>`;
    typeof el === "string" && (el = document.querySelector(el));
    let cpy = document.createElement("div");
    cpy.setAttribute("style", `
        padding: 10px;
        border-radius: 4px;
        border: 1px solid #ccc;
        background: #eee3;
        display: flex;
        justify-content: center;
        align-items: center;
        position: fixed;
        top: 3px;
        right: 3px;
        color: #444;
        cursor: pointer;
    `)
    cpy.innerHTML = copyIcon;
    cpy.onclick = () => {
        navigator.clipboard.writeText(el.innerText);
        cpy.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--ic" width="16" height="16" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19L21 7l-1.41-1.41L9 16.17z" fill="currentColor"></path></svg>`;
        setTimeout(() => (cpy.innerHTML = copyIcon), 500);
    }
    el.style.position = "relative";
    el.appendChild(cpy);
    }
})();
