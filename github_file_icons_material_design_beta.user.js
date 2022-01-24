// ==UserScript==
// @name         Material design icons (beta)
// @namespace    mailto:explosionscratch@gmail.com
// @version      0.1
// @description  Adds file Icons to GitHub
// @author       Explosion-Scratch
// @match        *://github.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        GM_getResourceText
// @resource     language_map https://gist.githubusercontent.com/Explosion-Scratch/ee1b9316ddb9389959697a00304bc57b/raw/4038781f76d14557d36e3ff2996a847437dc574e/map.json
// @require      https://unpkg.com/selector-set@1.1.5/selector-set.js
// @require      https://gist.githubusercontent.com/Explosion-Scratch/40f230387a424ed6b8b06beacc3b671e/raw/c029b8a62870a1dab08a05c140168fe20104bab9/Memoize%2520fetch%2520simple%2520version.js
// @require      https://unpkg.com/selector-observer@2.1.6/dist/index.umd.js
// @run-at       document-start
// ==/UserScript==

(async () => {
    //Requires SelectorSet
    SelectorObserver.observe('.js-navigation-container > .js-navigation-item', {
        add: icons
    });

    function icons(item) {
        let map = JSON.parse(GM_getResourceText("language_map"));
        console.log(map);
        //Item is '.js-navigation-container > .js-navigation-item' that changed
        const isFile = item.querySelector('.octicon-file');
        const name = item.querySelector('.js-navigation-open').textContent;
        const ext = name.split(".").slice(-1)[0];
        let icon = map.icons.find(i => i.fileNames?.includes(name)) || map.moreExtensions.fileNames[name] ||
              map.icons.find(i => i.fileExtensions?.includes(ext)) ||
              map.icons.find(i => i.name === ext) || map.moreExtensions.fileExtensions[ext] || map.defaultIcon;
        if (typeof icon === "string"){
             icon = map.icons.find(i => i.name === icon);
        }
        if (!isFile){
           icon = map.folders.icons.find(i => i.folderNames?.includes(name)) || map.folders.defaultIcon;
        }
        if (!icon?.name){return console.log("No icon", {ext, icon, isFile})}
        fetch(`https://raw.githubusercontent.com/PKief/vscode-material-icon-theme/main/icons/${icon.name}.svg`)
            .then(res => res.text())
            .then((svg) => (svg.startsWith("<svg") && item.querySelector("svg").replaceWith(createElement(svg))))
    }
    function createElement(htmlString) {
        var div = document.createElement('div');
        div.innerHTML = htmlString.trim();

        // Change this to div.childNodes to support multiple top-level nodes.
        return div.firstChild;
    }
    function loadFonts(fonts){
      let promises = [];
      for (let [fontName, url] of Object.entries(fonts)){
        promises.push(fetch(url)
            .then(resp => resp.arrayBuffer())
            .then(font => {
            const fontFace = new FontFace(fontName, font);
            document.fonts.add(fontFace);
        }))
      }
      return Promise.all(promises);
    }
})();
