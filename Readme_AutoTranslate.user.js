// ==UserScript==
// @name         README Translate
// @version      0.1
// @description  Auto translate Github READMEs when a `README-en` or `README.en` is present.
// @author       @Explosion-Scratch
// @match        https://github.com/*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=github.com
// @grant        none
// @namespace    mailto:explosionscratch@gmail.com
// @run-at       document-idle
// ==/UserScript==

(async () => {
  const PREAMBLE = `<div class="markdown-alert markdown-alert-note" dir="auto"><p dir="auto"><span class="color-fg-accent text-semibold d-inline-flex flex-items-center mb-1"><svg class="octicon octicon-info mr-2" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"></path></svg>Note</span><br>This README has been Translated to English by the <a href="USERSCRIPT_LINK">Translate to English  userscript</a>. Find the original at <a href="ORIGINAL_LINK">ORIGINAL_LINK</a></p></div>`;
  console.log("README TRANSLATE RUNNING");
  let link = [...document.querySelectorAll(".Box-row:has(a)")]
    .map((i) => i.querySelector("a"))
    .find((i) =>
      ["README-en.md", "README-en", "README.en", "README.en.md"]
        .map((j) => j.toLowerCase())
        .includes(i.innerText.toLowerCase()),
    )?.href;
  if (!link) {
    return;
  }
  console.log("README TRANSLATE:", link);
  let doc = await fetch(link)
    .then((r) => r.text())
    .then((t) => new DOMParser().parseFromString(t, "text/html"));

  let article = doc.documentElement.querySelector(
    "article[class*=markdown-body]",
  );
  window.ARTICLE_DEBUG = doc;

  if (!article) {
    return console.log(
      "README TRANSLATE: No article found",
      doc.documentElement,
    );
  }
  let readme = document.querySelector("#readme article.markdown-body");
  if (!readme) {
    return console.log("README TRANSLATE: No README element found");
  }
  console.log("README TRANSLATE: Replacing");
  readme.innerHTML =
    PREAMBLE.replaceAll("ORIGINAL_LINK", link).replaceAll(
      "USERSCRIPT_LINK",
      "https://github.com/explosion-scratch",
    ) +
    "\n\n\n" +
    article.innerHTML
      .replaceAll("\\n", "\n")
      .replaceAll('\\"', '"')
      .replaceAll("'", "'")
      .replaceAll("\\&quot;", "")
      .replaceAll("&quot;", '"');
  console.log("README TRANSLATE: Done", readme.innerHTML);
})();
