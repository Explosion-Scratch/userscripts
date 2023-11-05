// ==UserScript==
// @name         YouTube Summarize
// @namespace    mailto:explosionscratch@gmail.com
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @run-at       document-start
// ==/UserScript==

// NOTE: REQUIRES CHATGPT AUTO SEND USERSCRIPT (See other file on Repo)

/* Copyright (C) Sep 13, 2023 Explosion-Scratch - All Rights Reserved
 * You may use, distribute and modify this code under the
 * terms of the Attribution-ShareAlike 4.0 International license.
 *
 * You should have received a copy of the Attribution-ShareAlike
 * 4.0 International license with this file. If not, please write
 * to: explosionscatch@gmail.com, or visit:
 * https://creativecommons.org/licenses/by-sa/4.0/
 */
(async () => {
  console.log("Running YT Summarize");
  let captions;
  let captionText;
  let promiseRes;
  let p = new Promise((r) => (promiseRes = r));
  interceptXHR((response, url, method, body) => {
    console.log("Intercept:", { response, url, method, body });
    if (url.includes("timedtext")) {
      console.log("Captions:", response);
      captions = JSON.parse(response);
      captionText = captions.events
        .filter((i) => i.segs)
        .map((i) =>
          i.segs
            .map((j) => j.utf8)
            .filter((j) => j.trim().length)
            .join(" ")
        )
        .join(" ")
        .replace(/\s+/g, " ");
      console.log({ captionText });
      promiseRes();
    }
  }, unsafeWindow);
  await p;
  console.log({ captions, captionText });
  document.addEventListener("keyup", async (e) => {
    const INPUTS = "input, textarea, [contenteditable], [class*=Mirror]";
    if (
      e.target.closest(INPUTS) ||
      document.activeElement.closest(INPUTS) ||
      document.activeElement.matches(INPUTS)
    ) {
      return;
    }
    if (e.key === "s") {
      let prompt = captionText;
      console.log({ prompt });
      try {
        await unsafeWindow.navigator.clipboard.writeText(prompt);
      } catch (e) {
        prompt("Prompt:", prompt);
      }
      window.open(
        "https://chat.openai.com?copied=true&transcript=true",
        "_blank"
      );
    }
  });
})();

async function until(fn, args = []) {
  return new Promise((resolve) => {
    async function repeat() {
      let result;
      try {
        result = fn(...args);
      } catch (_) {}
      if (!result) {
        await requestAnimationFrame(repeat);
      } else {
        resolve(result);
      }
    }
    repeat();
  });
}

function interceptXHR(callback, win) {
  const originalXHR = win.XMLHttpRequest;
  function newXHR() {
    const xhr = new originalXHR();
    const originalOpen = xhr.open;
    xhr.open = function (method, url) {
      this.url = url;
      this.method = method;
      return originalOpen.apply(this, arguments);
    };
    xhr.addEventListener("readystatechange", function () {
      if (xhr.readyState === 4 && xhr.status >= 200 && xhr.status < 300) {
        callback(xhr.responseText, xhr.url, xhr.method, xhr.requestBody);
      }
    });
    const originalSend = xhr.send;
    xhr.send = function (body) {
      this.requestBody = body;
      return originalSend.apply(this, arguments);
    };
    return xhr;
  }
  win.XMLHttpRequest = newXHR;
}
