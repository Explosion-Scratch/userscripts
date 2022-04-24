// ==UserScript==
// @name         Sort tables
// @namespace    mailto:explosionscratch@gmail.com
// @source       https://github.com/Explosion-Scratch/userscripts/blob/main/sort_tables.user.js
// @updateURL    https://github.com/Explosion-Scratch/userscripts/raw/main/sort_tables.user.js
// @version      0.1
// @description  Sort GitHub tables (adds a button in table headers, super useful for READMEs)
// @author       Explosion-Scratch
// @match        https://github.com/*
// @icon         https://icons.duckduckgo.com/ip2/github.com.ico
// @grant        none
// ==/UserScript==

const getCellValue = (tr, idx) =>
  tr.children[idx].innerText || tr.children[idx].textContent;

const comparer = (idx, asc) => (a, b) =>
  ((v1, v2) =>
    v1 !== "" && v2 !== "" && !isNaN(v1) && !isNaN(v2)
      ? v1 - v2
      : v1.toString().localeCompare(v2))(
    getCellValue(asc ? a : b, idx),
    getCellValue(asc ? b : a, idx)
  );

document.querySelectorAll("th").forEach((th) =>
  th.addEventListener("click", () => {
    const table = th.closest("table");
    const tbody = table.querySelector("tbody");
    document
      .querySelectorAll("th")
      .forEach((a) => a.classList.remove("sorted"));
    th.classList.add("sorted");
    Array.from(tbody.querySelectorAll("tr"))
      .sort(
        comparer(
          Array.from(th.parentNode.children).indexOf(th),
          th.classList.toggle("asc")
        )
      )
      .forEach((tr) => tbody.appendChild(tr));
  })
);

let style = `th {
    position: relative;
    cursor: pointer;
    transition: background-color 0.2s ease;
    user-select: none;
}

th:hover,
th.sorted {
    background: #8882;
}

th:hover::after,
th.sorted::after {
    opacity: 1;
}

th::after {
    transition: opacity 0.2s ease;
    content: "🠻";
    opacity: 0;
    margin-left: 5px;
}

th.asc::after {
    content: "🠹";
}`

let s = document.createElement("style");
s.innerHTML = style;
document.head.appendChild(s);
