// ==UserScript==
// @name         GitHub file icons
// @namespace    mailto:explosionscratch@gmail.com
// @version      0.1
// @description  Adds file Icons to GitHub
// @author       Explosion-Scratch
// @match        *://github.com/*/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @resource     style https://raw.githubusercontent.com/lvarayut/github-file-icons/master/vendors/file-icons-js/css/style.css
// @grant        GM_getResourceText
// @connect      https://github.com/websemantics/file-icons-js/raw/master/fonts/octicons.woff2
// @connect      https://github.com/websemantics/file-icons-js/raw/master/fonts/devopicons.woff2
// @connect      https://github.com/websemantics/file-icons-js/raw/master/fonts/mfixx.woff2
// @connect      https://github.com/websemantics/file-icons-js/raw/master/fonts/file-icons.woff2
// @connect      https://github.com/websemantics/file-icons-js/raw/master/fonts/fontawesome.woff2
// @require      https://unpkg.com/selector-set@1.1.5/selector-set.js
// @require      https://unpkg.com/selector-observer@2.1.6/dist/index.umd.js
// @source       https://github.com/Explosion-Scratch/userscripts/blob/main/github_file_icons.user.js
// @updateURL    https://github.com/Explosion-Scratch/userscripts/raw/main/github_file_icons.user.js
// @run-at       document-end
// ==/UserScript==
/*
NOTE: Based on the Chrome Extension by @lvarayut, (https://github.com/lvarayut/github-file-icons)
*/
(async () => {
    let isColor = true;
    const DEFAULT_ICON = 'text-icon';
    let fileIcons = await import(`https://cdn.skypack.dev/file-icons-js`);
    let s = document.createElement("style");
    s.innerText = `${GM_getResourceText("style")}\n\n.gfi {color: rgba(3,47,98,0.55);display: inline-block;vertical-align: top;}`;
    document.head.appendChild(s);
    
    //Requires SelectorSet
    SelectorObserver.observe('.js-navigation-container > .js-navigation-item', {
        add: icons
    });
    
    let fonts = {
      octicons: 'https://github.com/websemantics/file-icons-js/raw/master/fonts/octicons.woff2',
      Devicons: 'https://github.com/websemantics/file-icons-js/raw/master/fonts/devopicons.woff2',
      Mfizz: 'https://github.com/websemantics/file-icons-js/raw/master/fonts/mfixx.woff2',
      "file-icons": 'https://github.com/websemantics/file-icons-js/raw/master/fonts/file-icons.woff2',
      FontAwesome: 'https://github.com/websemantics/file-icons-js/raw/master/fonts/fontawesome.woff2',
    }
    loadFonts(fonts);
  
    function icons(item) {
        //Item is '.js-navigation-container > .js-navigation-item' that changed
        const isFile = item.querySelector('.octicon-file');
        const name = item.querySelector('.js-navigation-open').textContent;
        const icon = document.createElement('span');

        if (isFile) {
            let className = fileIcons.getClass(name) || DEFAULT_ICON;

            if (isColor) {
                className = fileIcons.getClassWithColor(name) || DEFAULT_ICON;
            }

            icon.classList.add('octicon-file', 'gfi', ...className.split(' '));
            item.querySelector('svg').replaceWith(icon);
        }
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
