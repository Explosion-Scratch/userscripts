// ==UserScript==
// @name         GitHub infinite scroll
// @namespace    mailto:explosionscratch@gmail.com
// @source       https://github.com/Explosion-Scratch/userscripts/blob/main/github_infinite_scroll.user.js
// @updateURL    https://github.com/Explosion-Scratch/userscripts/raw/main/github_infinite_scroll.user.js
// @version      0.1
// @description  Infinite scroll on GitHub search pages
// @author       Explosion-Scratch
// @match        *://github.com/search*
// @icon         https://icons.duckduckgo.com/ip2/github.com.ico
// @grant        none
// ==/UserScript==

let infiniteScroll = (async()=>{
    let pageNum = 1;
    let loading = false;
    let stop = false;
    window.onscroll = ()=>{
        if (amountLeft() < window.innerHeight * 2 && !loading) {
            page(++pageNum);
        }
    }
    async function page(pageNum) {
        if (stop){return};
        loading = true;
        notice(loading);
        console.log(`Loading %o`, pageNum);
        let search = new URLSearchParams(location.search).get("q");
        let nextPage = await fetch(`https://github.com/search?p=${pageNum}&q=${search}&ref=simplesearch&type=Repositories`).then(res=>res.text());
        document.querySelector(".repo-list").innerHTML += new DOMParser().parseFromString(nextPage, "text/html").querySelector(".repo-list").innerHTML;
        if (new DOMParser().parseFromString(nextPage, "text/html").querySelector(".repo-list").querySelectorAll("li").length == 0){
            loading = false;
            notice(loading);
            return stop = true;
        }
        loading = false;
        pageBar(pageNum);
        notice(loading);
    }
    function notice(loading) {
        if (!loading) {
            return window.LOADING_NOTICE.remove();
        }
        window.LOADING_NOTICE?.remove();
        let s = window.LOADING_NOTICE = document.createElement("span");
        s.setAttribute("style", `
        position: fixed;
        bottom: 0;
        right: 0;
        border: 1px solid #ccc;
        padding: 6px 10px;
        background: #eee;
        color: #333;
        border-radius: 3px;
    `);
        s.innerText = "Loading next page...";
        document.body.appendChild(s);
    }
    function pageBar(num){
        let bar = document.createElement("li");
        bar.innerHTML = `
        <span style="margin-left: 5px; color: #666; margin-right: 10px;">${num}</span> <span class="bar" style="flex: 1; height: 1px; display: inline-block; background: #555; opacity: .2;"></span>
    `;
        bar.setAttribute("style", `
        width: 100%;
        display: flex;
        align-items: center;
    `)
        document.querySelector(".repo-list").appendChild(bar);
    }
    function amountLeft() {
        return _get_doc_height() - (_get_window_height() + _get_window_Yscroll());
    }
    /**
     * Get current browser viewpane heigtht
     */
    function _get_window_height() {
        return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || 0;
    }

    /**
     * Get current absolute window scroll position
     */
    function _get_window_Yscroll() {
        return window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop || 0;
    }

    /**
     * Get current absolute document height
     */
    function _get_doc_height() {
        return Math.max(document.body.scrollHeight || 0, document.documentElement.scrollHeight || 0, document.body.offsetHeight || 0, document.documentElement.offsetHeight || 0, document.body.clientHeight || 0, document.documentElement.clientHeight || 0);
    }
});


infiniteScroll();