// ==UserScript==
// @name         Material design icons
// @namespace    mailto:explosionscratch@gmail.com
// @version      0.2
// @description  Adds file Icons to GitHub
// @author       Explosion-Scratch
// @match        *://github.com/*
// @icon         https://icons.duckduckgo.com/ip2/github.com.ico
// @run-at       document-idle
// ==/UserScript==

// MAIN
/* Copyright (C) Dec 22, 2023 Explosion-Scratch - All Rights Reserved
 * You may use, distribute and modify this code under the
 * terms of the Attribution-ShareAlike 4.0 International license.
 *
 * You should have received a copy of the Attribution-ShareAlike
 * 4.0 International license with this file. If not, please write
 * to: explosionscatch@gmail.com, or visit:
 * https://creativecommons.org/licenses/by-sa/4.0/
 */
setTimeout(() => run(), 1);
const run = async () => {
  const ROW_SEL =
    ":is(.react-directory-row .react-directory-row-name-cell-large-screen, .PRIVATE_TreeView-item-content)";
  const style = `${ROW_SEL}:has(.custom-svg) svg:not(.custom-svg){display: none !important;}`;
  document.body.appendChild(createElement(`<style>${style}</style>`));
  //Requires SelectorSet
  SelectorObserver.observe(ROW_SEL, {
    add: icons,
  });
  function icons(item) {
    let map = globalThis.language_map;
    console.log(item);
    //Item is '.js-navigation-container > .js-navigation-item' that changed
    const isFile = item.querySelector(
      'path[d*="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75"]',
    );
    let name = item.querySelector(
      ".Link--primary, .PRIVATE_TreeView-item-content-text",
    ).textContent;
    name = name.split("/").slice(-1)[0]; //For nested folders
    console.log(name, isFile);
    let ext = name.split(".").slice(1).join("."); //For stuff with dual extensions, like .d.ts
    let icon =
      map.icons.find((i) => i.fileNames?.includes(name)) ||
      map.moreExtensions.fileNames[name] ||
      map.icons.find((i) => i.fileExtensions?.includes(ext)) ||
      map.icons.find((i) => i.name === ext) ||
      map.moreExtensions.fileExtensions[ext] ||
      map.defaultIcon;
    //We want .user.js and some things to fallback to .js
    if (icon.name === "file" && ext.split(".").length > 1) {
      ext = ext.split(".").slice(-1)[0];
      icon =
        map.icons.find((i) => i.fileNames?.includes(name)) ||
        map.moreExtensions.fileNames[name] ||
        map.icons.find((i) => i.fileExtensions?.includes(ext)) ||
        map.icons.find((i) => i.name === ext) ||
        map.moreExtensions.fileExtensions[ext] ||
        map.defaultIcon;
    }
    console.debug({ icon, ext, name, isFile });
    if (isFile && ext === "ts") {
      icon = { name: "typescript" };
    }
    if (typeof icon === "string") {
      icon = map.icons.find((i) => i.name === icon);
    }
    if (!isFile) {
      icon =
        map.folders.icons.find((i) => i.folderNames?.includes(name)) ||
        map.folders.defaultIcon;
    }
    if (!icon?.name) {
      return console.log("No icon", { ext, icon, isFile });
    }
    fetch(
      `https://raw.githubusercontent.com/PKief/vscode-material-icon-theme/main/icons/${icon.name}.svg`,
    )
      .then((res) => res.text())
      .then((svg) => {
        if (!svg.startsWith("<svg")) {
          return;
        }
        //            item.querySelector('.react-directory-filename-column svg').remove();
        const el = createElement(svg);
        el.setAttribute("width", 16);
        el.setAttribute("height", 16);
        el.classList.add("custom-svg");
        item.querySelector("svg").style.display = "none";
        item.querySelector("svg").innerHTML = "";
        item
          .querySelector("svg")
          .parentElement.insertAdjacentElement("afterbegin", el);
        //            item.querySelector('.react-directory-filename-column').insertAdjacentElement('afterbegin', createElement(svg));
      });
  }
  function createElement(htmlString) {
    var div = document.createElement("div");
    div.innerHTML = htmlString.trim();

    // Change this to div.childNodes to support multiple top-level nodes.
    return div.firstChild;
  }
  function loadFonts(fonts) {
    let promises = [];
    for (let [fontName, url] of Object.entries(fonts)) {
      promises.push(
        fetch(url)
          .then((resp) => resp.arrayBuffer())
          .then((font) => {
            const fontFace = new FontFace(fontName, font);
            document.fonts.add(fontFace);
          }),
      );
    }
    return Promise.all(promises);
  }
};
// END MAIN

// SCRIPT: MEMOIZE_FETCH
((window) => {
  var _fetch = window.fetch; //Get the original fetch functionm

  window.fetch = (url, opts = {}) => {
    if (!window.FETCH_CACHE) {
      window.FETCH_CACHE = {};
    }
    return new Promise((resolve) => {
      /*
      Generate a sort of unique key about this fetch request.
      GET requests will have `opts.method` and `opts.body` as
      undefined, which will be removed by JSON.stringify.

      For a fetch call such as this:

      fetch("https://apis.explosionscratc.repl.co/google?q=dogs")

      the key would be:
      "{url: 'https://apis.explosionscratc.repl.co'}"
      For a POST/DELETE/PUT request however, the key would also have the opts.method and opts.body (and possibly headers).
      */

      var key = JSON.stringify({
        url,
        method: opts.method,
        body: opts.body,
        headers: JSON.stringify(opts.headers),
      });

      //First check for existing cache entries:
      if (window.FETCH_CACHE[key]) {
        //Important to re-clone the response, otherwise we can't fetch something more than once!
        resolve(window.FETCH_CACHE[key].clone());
        console.log("Fetched from cache");
        return; //Important so we don't fetch anyways!
      }

      _fetch(url, opts).then((res) => {
        window.FETCH_CACHE[key] = res.clone(); //Store the response in the cache
        resolve(res); //Respond with the response of the fetch.
        console.log("Fetched new version");
      });
    });
  };
})(globalThis);
// END_SCRIPT: MEMOIZE FETCH
// SCRIPT: SELECTOR_SET
(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof exports === "object") {
    module.exports = factory();
  } else {
    root.SelectorSet = factory();
  }
})(this, function () {
  "use strict";

  // Public: Create a new SelectorSet.
  function SelectorSet() {
    // Construct new SelectorSet if called as a function.
    if (!(this instanceof SelectorSet)) {
      return new SelectorSet();
    }

    // Public: Number of selectors added to the set
    this.size = 0;

    // Internal: Incrementing ID counter
    this.uid = 0;

    // Internal: Array of String selectors in the set
    this.selectors = [];

    // Internal: Map of selector ids to objects
    this.selectorObjects = {};

    // Internal: All Object index String names mapping to Index objects.
    this.indexes = Object.create(this.indexes);

    // Internal: Used Object index String names mapping to Index objects.
    this.activeIndexes = [];
  }

  // Detect prefixed Element#matches function.
  var docElem = window.document.documentElement;
  var matches =
    docElem.matches ||
    docElem.webkitMatchesSelector ||
    docElem.mozMatchesSelector ||
    docElem.oMatchesSelector ||
    docElem.msMatchesSelector;

  // Public: Check if element matches selector.
  //
  // Maybe overridden with custom Element.matches function.
  //
  // el       - An Element
  // selector - String CSS selector
  //
  // Returns true or false.
  SelectorSet.prototype.matchesSelector = function (el, selector) {
    return matches.call(el, selector);
  };

  // Public: Find all elements in the context that match the selector.
  //
  // Maybe overridden with custom querySelectorAll function.
  //
  // selectors - String CSS selectors.
  // context   - Element context
  //
  // Returns non-live list of Elements.
  SelectorSet.prototype.querySelectorAll = function (selectors, context) {
    return context.querySelectorAll(selectors);
  };

  // Public: Array of indexes.
  //
  // name     - Unique String name
  // selector - Function that takes a String selector and returns a String key
  //            or undefined if it can't be used by the index.
  // element  - Function that takes an Element and returns an Array of String
  //            keys that point to indexed values.
  //
  SelectorSet.prototype.indexes = [];

  // Index by element id
  var idRe = /^#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/g;
  SelectorSet.prototype.indexes.push({
    name: "ID",
    selector: function matchIdSelector(sel) {
      var m;
      if ((m = sel.match(idRe))) {
        return m[0].slice(1);
      }
    },
    element: function getElementId(el) {
      if (el.id) {
        return [el.id];
      }
    },
  });

  // Index by all of its class names
  var classRe = /^\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/g;
  SelectorSet.prototype.indexes.push({
    name: "CLASS",
    selector: function matchClassSelector(sel) {
      var m;
      if ((m = sel.match(classRe))) {
        return m[0].slice(1);
      }
    },
    element: function getElementClassNames(el) {
      var className = el.className;
      if (className) {
        if (typeof className === "string") {
          return className.split(/\s/);
        } else if (typeof className === "object" && "baseVal" in className) {
          // className is a SVGAnimatedString
          // global SVGAnimatedString is not an exposed global in Opera 12
          return className.baseVal.split(/\s/);
        }
      }
    },
  });

  // Index by tag/node name: `DIV`, `FORM`, `A`
  var tagRe = /^((?:[\w\u00c0-\uFFFF\-]|\\.)+)/g;
  SelectorSet.prototype.indexes.push({
    name: "TAG",
    selector: function matchTagSelector(sel) {
      var m;
      if ((m = sel.match(tagRe))) {
        return m[0].toUpperCase();
      }
    },
    element: function getElementTagName(el) {
      return [el.nodeName.toUpperCase()];
    },
  });

  // Default index just contains a single array of elements.
  SelectorSet.prototype.indexes["default"] = {
    name: "UNIVERSAL",
    selector: function () {
      return true;
    },
    element: function () {
      return [true];
    },
  };

  // Use ES Maps when supported
  var Map;
  if (typeof window.Map === "function") {
    Map = window.Map;
  } else {
    Map = (function () {
      function Map() {
        this.map = {};
      }
      Map.prototype.get = function (key) {
        return this.map[key + " "];
      };
      Map.prototype.set = function (key, value) {
        this.map[key + " "] = value;
      };
      return Map;
    })();
  }

  // Regexps adopted from Sizzle
  //   https://github.com/jquery/sizzle/blob/1.7/sizzle.js
  //
  var chunker =
    /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g;

  // Internal: Get indexes for selector.
  //
  // selector - String CSS selector
  //
  // Returns Array of {index, key}.
  function parseSelectorIndexes(allIndexes, selector) {
    allIndexes = allIndexes.slice(0).concat(allIndexes["default"]);

    var allIndexesLen = allIndexes.length,
      i,
      j,
      m,
      dup,
      rest = selector,
      key,
      index,
      indexes = [];

    do {
      chunker.exec("");
      if ((m = chunker.exec(rest))) {
        rest = m[3];
        if (m[2] || !rest) {
          for (i = 0; i < allIndexesLen; i++) {
            index = allIndexes[i];
            if ((key = index.selector(m[1]))) {
              j = indexes.length;
              dup = false;
              while (j--) {
                if (indexes[j].index === index && indexes[j].key === key) {
                  dup = true;
                  break;
                }
              }
              if (!dup) {
                indexes.push({ index: index, key: key });
              }
              break;
            }
          }
        }
      }
    } while (m);

    return indexes;
  }

  // Internal: Find first item in Array that is a prototype of `proto`.
  //
  // ary   - Array of objects
  // proto - Prototype of expected item in `ary`
  //
  // Returns object from `ary` if found. Otherwise returns undefined.
  function findByPrototype(ary, proto) {
    var i, len, item;
    for (i = 0, len = ary.length; i < len; i++) {
      item = ary[i];
      if (proto.isPrototypeOf(item)) {
        return item;
      }
    }
  }

  // Public: Log when added selector falls under the default index.
  //
  // This API should not be considered stable. May change between
  // minor versions.
  //
  // obj - {selector, data} Object
  //
  //   SelectorSet.prototype.logDefaultIndexUsed = function(obj) {
  //     console.warn(obj.selector, "could not be indexed");
  //   };
  //
  // Returns nothing.
  SelectorSet.prototype.logDefaultIndexUsed = function () {};

  // Public: Add selector to set.
  //
  // selector - String CSS selector
  // data     - Optional data Object (default: undefined)
  //
  // Returns nothing.
  SelectorSet.prototype.add = function (selector, data) {
    var obj,
      i,
      indexProto,
      key,
      index,
      objs,
      selectorIndexes,
      selectorIndex,
      indexes = this.activeIndexes,
      selectors = this.selectors,
      selectorObjects = this.selectorObjects;

    if (typeof selector !== "string") {
      return;
    }

    obj = {
      id: this.uid++,
      selector: selector,
      data: data,
    };
    selectorObjects[obj.id] = obj;

    selectorIndexes = parseSelectorIndexes(this.indexes, selector);
    for (i = 0; i < selectorIndexes.length; i++) {
      selectorIndex = selectorIndexes[i];
      key = selectorIndex.key;
      indexProto = selectorIndex.index;

      index = findByPrototype(indexes, indexProto);
      if (!index) {
        index = Object.create(indexProto);
        index.map = new Map();
        indexes.push(index);
      }

      if (indexProto === this.indexes["default"]) {
        this.logDefaultIndexUsed(obj);
      }
      objs = index.map.get(key);
      if (!objs) {
        objs = [];
        index.map.set(key, objs);
      }
      objs.push(obj);
    }

    this.size++;
    selectors.push(selector);
  };

  // Public: Remove selector from set.
  //
  // selector - String CSS selector
  // data     - Optional data Object (default: undefined)
  //
  // Returns nothing.
  SelectorSet.prototype.remove = function (selector, data) {
    if (typeof selector !== "string") {
      return;
    }

    var selectorIndexes,
      selectorIndex,
      i,
      j,
      k,
      selIndex,
      objs,
      obj,
      indexes = this.activeIndexes,
      selectors = (this.selectors = []),
      selectorObjects = this.selectorObjects,
      removedIds = {},
      removeAll = arguments.length === 1;

    selectorIndexes = parseSelectorIndexes(this.indexes, selector);
    for (i = 0; i < selectorIndexes.length; i++) {
      selectorIndex = selectorIndexes[i];

      j = indexes.length;
      while (j--) {
        selIndex = indexes[j];
        if (selectorIndex.index.isPrototypeOf(selIndex)) {
          objs = selIndex.map.get(selectorIndex.key);
          if (objs) {
            k = objs.length;
            while (k--) {
              obj = objs[k];
              if (
                obj.selector === selector &&
                (removeAll || obj.data === data)
              ) {
                objs.splice(k, 1);
                removedIds[obj.id] = true;
              }
            }
          }
          break;
        }
      }
    }

    for (i in removedIds) {
      delete selectorObjects[i];
      this.size--;
    }

    for (i in selectorObjects) {
      selectors.push(selectorObjects[i].selector);
    }
  };

  // Sort by id property handler.
  //
  // a - Selector obj.
  // b - Selector obj.
  //
  // Returns Number.
  function sortById(a, b) {
    return a.id - b.id;
  }

  // Public: Find all matching decendants of the context element.
  //
  // context - An Element
  //
  // Returns Array of {selector, data, elements} matches.
  SelectorSet.prototype.queryAll = function (context) {
    if (!this.selectors.length) {
      return [];
    }

    var matches = {},
      results = [];
    var els = this.querySelectorAll(this.selectors.join(", "), context);

    var i, j, len, len2, el, m, match, obj;
    for (i = 0, len = els.length; i < len; i++) {
      el = els[i];
      m = this.matches(el);
      for (j = 0, len2 = m.length; j < len2; j++) {
        obj = m[j];
        if (!matches[obj.id]) {
          match = {
            id: obj.id,
            selector: obj.selector,
            data: obj.data,
            elements: [],
          };
          matches[obj.id] = match;
          results.push(match);
        } else {
          match = matches[obj.id];
        }
        match.elements.push(el);
      }
    }

    return results.sort(sortById);
  };

  // Public: Match element against all selectors in set.
  //
  // el - An Element
  //
  // Returns Array of {selector, data} matches.
  SelectorSet.prototype.matches = function (el) {
    if (!el) {
      return [];
    }

    var i, j, k, len, len2, len3, index, keys, objs, obj, id;
    var indexes = this.activeIndexes,
      matchedIds = {},
      matches = [];

    for (i = 0, len = indexes.length; i < len; i++) {
      index = indexes[i];
      keys = index.element(el);
      if (keys) {
        for (j = 0, len2 = keys.length; j < len2; j++) {
          if ((objs = index.map.get(keys[j]))) {
            for (k = 0, len3 = objs.length; k < len3; k++) {
              obj = objs[k];
              id = obj.id;
              if (!matchedIds[id] && this.matchesSelector(el, obj.selector)) {
                matchedIds[id] = true;
                matches.push(obj);
              }
            }
          }
        }
      }
    }

    return matches.sort(sortById);
  };

  // Public: Export SelectorSet
  return SelectorSet;
});

// END SCRIPT: SELECTOR SET
// SCRIPT: SELECTOR_OBSERVER
(function (global, factory) {
  typeof exports === "object" && typeof module !== "undefined"
    ? factory(exports, require("selector-set"))
    : typeof define === "function" && define.amd
    ? define(["exports", "selector-set"], factory)
    : factory((global.SelectorObserver = {}), global.SelectorSet);
})(this, function (exports, SelectorSet) {
  "use strict";

  SelectorSet =
    SelectorSet && SelectorSet.hasOwnProperty("default")
      ? SelectorSet["default"]
      : SelectorSet;

  var el = null;
  var observer = null;
  var queue = [];

  function scheduleBatch(document, callback) {
    var calls = [];

    function processBatchQueue() {
      var callsCopy = calls;
      calls = [];
      callback(callsCopy);
    }

    function scheduleBatchQueue() {
      for (
        var _len = arguments.length, args = Array(_len), _key = 0;
        _key < _len;
        _key++
      ) {
        args[_key] = arguments[_key];
      }

      calls.push(args);
      if (calls.length === 1) scheduleMacroTask(document, processBatchQueue);
    }

    return scheduleBatchQueue;
  }

  function scheduleMacroTask(document, callback) {
    if (!observer) {
      observer = new MutationObserver(handleMutations);
    }

    if (!el) {
      el = document.createElement("div");
      observer.observe(el, { attributes: true });
    }

    queue.push(callback);
    el.setAttribute("data-twiddle", "" + Date.now());
  }

  function handleMutations() {
    var callbacks = queue;
    queue = [];
    for (var i = 0; i < callbacks.length; i++) {
      try {
        callbacks[i]();
      } catch (error) {
        setTimeout(function () {
          throw error;
        }, 0);
      }
    }
  }

  // selector-observer processes dom mutations in two phases. This module applies
  // the Change set from the first phase and invokes the any registered hooks.

  var initMap = new WeakMap();
  var initializerMap = new WeakMap();
  var subscriptionMap = new WeakMap();
  var addMap = new WeakMap();

  function applyChanges(selectorObserver, changes) {
    for (var i = 0; i < changes.length; i++) {
      var change = changes[i];
      var type = change[0];
      var el = change[1];
      var observer = change[2];
      if (type === ADD) {
        runInit(observer, el);
        runAdd(observer, el);
      } else if (type === REMOVE) {
        runRemove(observer, el);
      } else if (type === REMOVE_ALL) {
        runRemoveAll(selectorObserver.observers, el);
      }
    }
  }

  // Run observer node "initialize" callback once.
  // Call when observer selector matches node.
  //
  // observer - An observer Object.
  // el       - An Element
  //
  // Returns nothing.
  function runInit(observer, el) {
    if (!(el instanceof observer.elementConstructor)) {
      return;
    }

    var initIds = initMap.get(el);
    if (!initIds) {
      initIds = [];
      initMap.set(el, initIds);
    }

    if (initIds.indexOf(observer.id) === -1) {
      var initializer = void 0;
      if (observer.initialize) {
        initializer = observer.initialize.call(undefined, el);
      }
      if (initializer) {
        var initializers = initializerMap.get(el);
        if (!initializers) {
          initializers = {};
          initializerMap.set(el, initializers);
        }
        initializers["" + observer.id] = initializer;
      }
      initIds.push(observer.id);
    }
  }

  // Run observer node "add" callback.
  // Call when observer selector matches node.
  //
  // observer - An observer Object.
  // el       - An Element
  //
  // Returns nothing.
  function runAdd(observer, el) {
    if (!(el instanceof observer.elementConstructor)) {
      return;
    }

    var addIds = addMap.get(el);
    if (!addIds) {
      addIds = [];
      addMap.set(el, addIds);
    }

    if (addIds.indexOf(observer.id) === -1) {
      observer.elements.push(el);

      var initializers = initializerMap.get(el);
      var initializer = initializers ? initializers["" + observer.id] : null;
      if (initializer && initializer.add) {
        initializer.add.call(undefined, el);
      }

      if (observer.subscribe) {
        var subscription = observer.subscribe.call(undefined, el);
        if (subscription) {
          var subscriptions = subscriptionMap.get(el);
          if (!subscriptions) {
            subscriptions = {};
            subscriptionMap.set(el, subscriptions);
          }
          subscriptions["" + observer.id] = subscription;
        }
      }

      if (observer.add) {
        observer.add.call(undefined, el);
      }

      addIds.push(observer.id);
    }
  }

  // Runs all observer element "remove" callbacks.
  // Call when element is completely removed from the DOM.
  //
  // observer - An observer Object.
  // el       - An Element
  //
  // Returns nothing.
  function runRemove(observer, el) {
    if (!(el instanceof observer.elementConstructor)) {
      return;
    }

    var addIds = addMap.get(el);
    if (!addIds) {
      return;
    }

    var index = observer.elements.indexOf(el);
    if (index !== -1) {
      observer.elements.splice(index, 1);
    }

    index = addIds.indexOf(observer.id);
    if (index !== -1) {
      var initializers = initializerMap.get(el);
      var initializer = initializers ? initializers["" + observer.id] : null;
      if (initializer) {
        if (initializer.remove) {
          initializer.remove.call(undefined, el);
        }
      }

      if (observer.subscribe) {
        var subscriptions = subscriptionMap.get(el);
        var subscription = subscriptions
          ? subscriptions["" + observer.id]
          : null;
        if (subscription && subscription.unsubscribe) {
          subscription.unsubscribe();
        }
      }

      if (observer.remove) {
        observer.remove.call(undefined, el);
      }

      addIds.splice(index, 1);
    }

    if (addIds.length === 0) {
      addMap.delete(el);
    }
  }

  // Runs all observer element "remove" callbacks.
  // Call when element is completely removed from the DOM.
  //
  // observes - Array of observers
  // el - An Element
  //
  // Returns nothing.
  function runRemoveAll(observers, el) {
    var addIds = addMap.get(el);
    if (!addIds) {
      return;
    }

    var ids = addIds.slice(0);
    for (var i = 0; i < ids.length; i++) {
      var observer = observers[ids[i]];
      if (!observer) {
        continue;
      }

      var index = observer.elements.indexOf(el);
      if (index !== -1) {
        observer.elements.splice(index, 1);
      }

      var initializers = initializerMap.get(el);
      var initializer = initializers ? initializers["" + observer.id] : null;
      if (initializer && initializer.remove) {
        initializer.remove.call(undefined, el);
      }

      var subscriptions = subscriptionMap.get(el);
      var subscription = subscriptions ? subscriptions["" + observer.id] : null;
      if (subscription && subscription.unsubscribe) {
        subscription.unsubscribe();
      }

      if (observer.remove) {
        observer.remove.call(undefined, el);
      }
    }
    addMap.delete(el);
  }

  var innerHTMLReplacementIsBuggy = null;

  // In IE 9/10/11 replacing child via innerHTML will orphan all of the child
  // elements. This prevents walking the descendants of removedNodes.
  // https://connect.microsoft.com/IE/feedback/details/797844/ie9-10-11-dom-child-kill-bug
  function detectInnerHTMLReplacementBuggy(document) {
    if (innerHTMLReplacementIsBuggy === null) {
      var a = document.createElement("div");
      var b = document.createElement("div");
      var c = document.createElement("div");
      a.appendChild(b);
      b.appendChild(c);
      a.innerHTML = "";
      innerHTMLReplacementIsBuggy = c.parentNode !== b;
    }
    return innerHTMLReplacementIsBuggy;
  }

  function supportsSelectorMatching(node) {
    return (
      "matches" in node ||
      "webkitMatchesSelector" in node ||
      "mozMatchesSelector" in node ||
      "oMatchesSelector" in node ||
      "msMatchesSelector" in node
    );
  }

  // selector-observer processes dom mutations in two phases. This module
  // processes DOM mutations, revalidates selectors against the target element and
  // enqueues a Change for an observers hooks to be ran.

  // A set of Changes is structured as an Array of tuples:
  //
  // [ADD, element, observer]: Indicates that an observer starting matching
  // the element.
  var ADD = 1;

  // [REMOVE, element, observer]: Indicates that an observer stopped matching
  // the element.
  var REMOVE = 2;

  // [REMOVE_ALL, element]: Indicates that an element was removed from the
  // document and all related observers stopped matching the element.
  var REMOVE_ALL = 3;

  // A handler for processing MutationObserver mutations.
  //
  // selectorObserver - The SelectorObserver
  // changes - Array of changes to append to
  // mutations - An array of MutationEvents
  //
  // Return nothing.
  function handleMutations$1(selectorObserver, changes, mutations) {
    for (var i = 0; i < mutations.length; i++) {
      var mutation = mutations[i];
      if (mutation.type === "childList") {
        addNodes(selectorObserver, changes, mutation.addedNodes);
        removeNodes(selectorObserver, changes, mutation.removedNodes);
      } else if (mutation.type === "attributes") {
        revalidateObservers(selectorObserver, changes, mutation.target);
      }
    }
    if (detectInnerHTMLReplacementBuggy(selectorObserver.ownerDocument)) {
      revalidateOrphanedElements(selectorObserver, changes);
    }
  }

  // Run observer node "add" callback once on the any matching
  // node and its subtree.
  //
  // selectorObserver - The SelectorObserver
  // changes - Array of changes to append to
  // nodes   - A NodeList of Nodes
  //
  // Returns nothing.
  function addNodes(selectorObserver, changes, nodes) {
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];

      if (supportsSelectorMatching(node)) {
        var matches = selectorObserver.selectorSet.matches(node);
        for (var j = 0; j < matches.length; j++) {
          var data = matches[j].data;

          changes.push([ADD, node, data]);
        }
      }

      if ("querySelectorAll" in node) {
        var matches2 = selectorObserver.selectorSet.queryAll(node);
        for (var _j = 0; _j < matches2.length; _j++) {
          var _matches2$_j = matches2[_j],
            _data = _matches2$_j.data,
            elements = _matches2$_j.elements;

          for (var k = 0; k < elements.length; k++) {
            changes.push([ADD, elements[k], _data]);
          }
        }
      }
    }
  }

  // Run all observer node "remove" callbacks on the node
  // and its entire subtree.
  //
  // selectorObserver - The SelectorObserver
  // changes - Array of changes to append to
  // nodes   - A NodeList of Nodes
  //
  // Returns nothing.
  function removeNodes(selectorObserver, changes, nodes) {
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      if ("querySelectorAll" in node) {
        changes.push([REMOVE_ALL, node]);
        var descendants = node.querySelectorAll("*");
        for (var j = 0; j < descendants.length; j++) {
          changes.push([REMOVE_ALL, descendants[j]]);
        }
      }
    }
  }

  // Recheck all "add" observers to see if the selector still matches.
  // If not, run the "remove" callback.
  //
  // selectorObserver - The SelectorObserver
  // changes - Array of changes to append to
  // node    - A Node
  //
  // Returns nothing.
  function revalidateObservers(selectorObserver, changes, node) {
    if (supportsSelectorMatching(node)) {
      var matches = selectorObserver.selectorSet.matches(node);
      for (var i = 0; i < matches.length; i++) {
        var data = matches[i].data;

        changes.push([ADD, node, data]);
      }
    }

    if ("querySelectorAll" in node) {
      var ids = addMap.get(node);
      if (ids) {
        for (var _i = 0; _i < ids.length; _i++) {
          var observer = selectorObserver.observers[ids[_i]];
          if (observer) {
            if (
              !selectorObserver.selectorSet.matchesSelector(
                node,
                observer.selector,
              )
            ) {
              changes.push([REMOVE, node, observer]);
            }
          }
        }
      }
    }
  }

  // Recheck all "add" observers to see if the selector still matches.
  // If not, run the "remove" callback. Runs on node and all its descendants.
  //
  // selectorObserver - The SelectorObserver
  // changes - Array of changes to append to
  // node    - The root Node
  //
  // Returns nothing.
  function revalidateDescendantObservers(selectorObserver, changes, node) {
    if ("querySelectorAll" in node) {
      revalidateObservers(selectorObserver, changes, node);
      var descendants = node.querySelectorAll("*");
      for (var i = 0; i < descendants.length; i++) {
        revalidateObservers(selectorObserver, changes, descendants[i]);
      }
    }
  }

  // Recheck input after "change" event and possible related form elements.
  //
  // selectorObserver - The SelectorObserver
  // changes - Array of changes to append to
  // input   - The HTMLInputElement
  //
  // Returns nothing.
  function revalidateInputObservers(selectorObserver, changes, inputs) {
    for (var i = 0; i < inputs.length; i++) {
      var input = inputs[i];
      var els = input.form
        ? input.form.elements
        : selectorObserver.rootNode.querySelectorAll("input");
      for (var j = 0; j < els.length; j++) {
        revalidateObservers(selectorObserver, changes, els[j]);
      }
    }
  }

  // Check all observed elements to see if they are still in the DOM.
  // Only intended to run on IE where innerHTML replacement is buggy.
  //
  // selectorObserver - The SelectorObserver
  // changes - Array of changes to append to
  //
  // Returns nothing.
  function revalidateOrphanedElements(selectorObserver, changes) {
    for (var i = 0; i < selectorObserver.observers.length; i++) {
      var observer = selectorObserver.observers[i];
      if (observer) {
        var elements = observer.elements;

        for (var j = 0; j < elements.length; j++) {
          var el = elements[j];
          if (!el.parentNode) {
            changes.push([REMOVE_ALL, el]);
          }
        }
      }
    }
  }

  function whenReady(document, callback) {
    var readyState = document.readyState;
    if (readyState === "interactive" || readyState === "complete") {
      scheduleMacroTask(document, callback);
    } else {
      document.addEventListener(
        "DOMContentLoaded",
        scheduleMacroTask(document, callback),
      );
    }
  }

  var _typeof =
    typeof Symbol === "function" && typeof Symbol.iterator === "symbol"
      ? function (obj) {
          return typeof obj;
        }
      : function (obj) {
          return obj &&
            typeof Symbol === "function" &&
            obj.constructor === Symbol &&
            obj !== Symbol.prototype
            ? "symbol"
            : typeof obj;
        };

  // Observer uid counter
  var uid = 0;

  function SelectorObserver(rootNode) {
    this.rootNode =
      rootNode.nodeType === 9 ? rootNode.documentElement : rootNode;
    this.ownerDocument =
      rootNode.nodeType === 9 ? rootNode : rootNode.ownerDocument;

    // Map of observer id to object
    this.observers = [];

    // Index of selectors to observer objects
    this.selectorSet = new SelectorSet();

    // Process all mutations from root element
    this.mutationObserver = new MutationObserver(
      handleRootMutations.bind(this, this),
    );

    this._scheduleAddRootNodes = scheduleBatch(
      this.ownerDocument,
      addRootNodes.bind(this, this),
    );

    this._handleThrottledChangedTargets = scheduleBatch(
      this.ownerDocument,
      handleChangedTargets.bind(this, this),
    );
    this.rootNode.addEventListener(
      "change",
      handleChangeEvents.bind(this, this),
      false,
    );

    whenReady(this.ownerDocument, onReady.bind(this, this));
  }

  SelectorObserver.prototype.disconnect = function () {
    this.mutationObserver.disconnect();
  };

  // Register a new observer.
  //
  // selector - String CSS selector.
  // handlers - Initialize Function or Object with keys:
  //   initialize - Function to invoke once when Node is first matched
  //   add        - Function to invoke when Node matches selector
  //   remove     - Function to invoke when Node no longer matches selector
  //   subscribe  - Function to invoke when Node matches selector and returns Subscription.
  //
  // Returns Observer object.
  SelectorObserver.prototype.observe = function (a, b) {
    var handlers = void 0;

    if (typeof b === "function") {
      handlers = {
        selector: a,
        initialize: b,
      };
    } else if (
      (typeof b === "undefined" ? "undefined" : _typeof(b)) === "object"
    ) {
      handlers = b;
      handlers.selector = a;
    } else {
      handlers = a;
    }

    var self = this;

    var observer = {
      id: uid++,
      selector: handlers.selector,
      initialize: handlers.initialize,
      add: handlers.add,
      remove: handlers.remove,
      subscribe: handlers.subscribe,
      elements: [],
      elementConstructor: handlers.hasOwnProperty("constructor")
        ? handlers.constructor
        : this.ownerDocument.defaultView.Element,
      abort: function abort() {
        self._abortObserving(observer);
      },
    };
    this.selectorSet.add(observer.selector, observer);
    this.observers[observer.id] = observer;
    this._scheduleAddRootNodes();

    return observer;
  };

  // Removes observer and calls any remaining remove hooks.
  //
  // observer - Observer object
  //
  // Returns nothing.
  SelectorObserver.prototype._abortObserving = function (observer) {
    var elements = observer.elements;
    for (var i = 0; i < elements.length; i++) {
      runRemove(observer, elements[i]);
    }
    this.selectorSet.remove(observer.selector, observer);
    delete this.observers[observer.id];
  };

  // Internal: For hacking in dirty changes that aren't getting picked up
  SelectorObserver.prototype.triggerObservers = function (container) {
    var changes = [];
    revalidateDescendantObservers(this, changes, container);
    applyChanges(this, changes);
  };

  function onReady(selectorObserver) {
    selectorObserver.mutationObserver.observe(selectorObserver.rootNode, {
      childList: true,
      attributes: true,
      subtree: true,
    });
    selectorObserver._scheduleAddRootNodes();
  }

  function addRootNodes(selectorObserver) {
    var changes = [];
    addNodes(selectorObserver, changes, [selectorObserver.rootNode]);
    applyChanges(selectorObserver, changes);
  }

  function handleRootMutations(selectorObserver, mutations) {
    var changes = [];
    handleMutations$1(selectorObserver, changes, mutations);
    applyChanges(selectorObserver, changes);
  }

  function handleChangeEvents(selectorObserver, event) {
    selectorObserver._handleThrottledChangedTargets(event.target);
  }

  function handleChangedTargets(selectorObserver, inputs) {
    var changes = [];
    revalidateInputObservers(selectorObserver, changes, inputs);
    applyChanges(selectorObserver, changes);
  }

  // observe
  //
  // Observe provides a declarative hook thats informed when an element becomes
  // matched by a selector, and then when it stops matching the selector.
  //
  // Examples
  //
  //   observe('.js-foo', (el) => {
  //     console.log(el, 'was added to the DOM')
  //   })
  //
  //   observe('.js-bar', {
  //     add(el) { console.log('js-bar was added to', el) },
  //     remove(el) { console.log 'js-bar was removed from', el) }
  //   })
  //

  var documentObserver = void 0;

  function getDocumentObserver() {
    if (!documentObserver) {
      documentObserver = new SelectorObserver(window.document);
    }
    return documentObserver;
  }

  function observe() {
    var _getDocumentObserver;

    return (_getDocumentObserver = getDocumentObserver()).observe.apply(
      _getDocumentObserver,
      arguments,
    );
  }

  function triggerObservers() {
    var _getDocumentObserver2;

    return (_getDocumentObserver2 =
      getDocumentObserver()).triggerObservers.apply(
      _getDocumentObserver2,
      arguments,
    );
  }

  exports.getDocumentObserver = getDocumentObserver;
  exports.observe = observe;
  exports.triggerObservers = triggerObservers;
  exports.default = SelectorObserver;

  Object.defineProperty(exports, "__esModule", { value: true });
});
// END SCRIPT: SELECTOR OBSERVER

// SCRIPT: LANGUAGE MAP
/* Copyright (C) Dec 22, 2023 Explosion-Scratch - All Rights Reserved
 * You may use, distribute and modify this code under the
 * terms of the Attribution-ShareAlike 4.0 International license.
 *
 * You should have received a copy of the Attribution-ShareAlike
 * 4.0 International license with this file. If not, please write
 * to: explosionscatch@gmail.com, or visit:
 * https://creativecommons.org/licenses/by-sa/4.0/
 */
globalThis.language_map = {
  defaultIcon: {
    name: "file",
  },
  icons: [
    {
      name: "html",
      fileExtensions: ["htm", "xhtml", "html_vm", "asp"],
    },
    {
      name: "pug",
      fileExtensions: ["jade", "pug"],
      fileNames: [".pug-lintrc", ".pug-lintrc.js", ".pug-lintrc.json"],
    },
    {
      name: "markdown",
      fileExtensions: ["md", "markdown", "rst"],
    },
    {
      name: "blink",
      fileExtensions: ["blink"],
      light: true,
    },
    {
      name: "css",
      fileExtensions: ["css"],
    },
    {
      name: "sass",
      fileExtensions: ["scss", "sass"],
    },
    {
      name: "less",
      fileExtensions: ["less"],
    },
    {
      name: "json",
      fileExtensions: ["json", "tsbuildinfo", "json5", "jsonl", "ndjson"],
      fileNames: [
        ".jscsrc",
        ".jshintrc",
        "composer.lock",
        ".jsbeautifyrc",
        ".esformatter",
        "cdp.pid",
        ".lintstagedrc",
      ],
    },
    {
      name: "jinja",
      fileExtensions: ["jinja", "jinja2", "j2", "jinja-html"],
      light: true,
    },
    {
      name: "proto",
      fileExtensions: ["proto"],
    },
    {
      name: "playwright",
      fileNames: ["playwright.config.js", "playwright.config.ts"],
    },
    {
      name: "sublime",
      fileExtensions: ["sublime-project", "sublime-workspace"],
    },
    {
      name: "twine",
      fileExtensions: ["tw", "twee"],
    },
    {
      name: "yaml",
      fileExtensions: [
        "yml",
        "yaml",
        "yml.dist",
        "yaml.dist",
        "YAML-tmLanguage",
      ],
    },
    {
      name: "xml",
      fileExtensions: [
        "xml",
        "plist",
        "xsd",
        "dtd",
        "xsl",
        "xslt",
        "resx",
        "iml",
        "xquery",
        "tmLanguage",
        "manifest",
        "project",
        "xml.dist",
        "xml.dist.sample",
        "dmn",
      ],
      fileNames: [".htaccess"],
    },
    {
      name: "image",
      fileExtensions: [
        "png",
        "jpeg",
        "jpg",
        "gif",
        "ico",
        "tif",
        "tiff",
        "psd",
        "psb",
        "ami",
        "apx",
        "bmp",
        "bpg",
        "brk",
        "cur",
        "dds",
        "dng",
        "exr",
        "fpx",
        "gbr",
        "img",
        "jbig2",
        "jb2",
        "jng",
        "jxr",
        "pgf",
        "pic",
        "raw",
        "webp",
        "eps",
        "afphoto",
        "ase",
        "aseprite",
        "clip",
        "cpt",
        "heif",
        "heic",
        "kra",
        "mdp",
        "ora",
        "pdn",
        "reb",
        "sai",
        "tga",
        "xcf",
        "jfif",
        "ppm",
        "pbm",
        "pgm",
        "pnm",
      ],
    },
    {
      name: "javascript",
      fileExtensions: ["esx", "mjs"],
    },
    {
      name: "react",
      fileExtensions: ["jsx"],
    },
    {
      name: "react_ts",
      fileExtensions: ["tsx"],
    },
    {
      name: "routing",
      fileExtensions: [
        "routing.ts",
        "routing.tsx",
        "routing.js",
        "routing.jsx",
        "routes.ts",
        "routes.tsx",
        "routes.js",
        "routes.jsx",
      ],
      fileNames: [
        "router.js",
        "router.jsx",
        "router.ts",
        "router.tsx",
        "routes.js",
        "routes.jsx",
        "routes.ts",
        "routes.tsx",
      ],
    },
    {
      name: "redux-action",
      fileExtensions: ["action.js", "actions.js", "action.ts", "actions.ts"],
      fileNames: ["action.js", "actions.js", "action.ts", "actions.ts"],
    },
    {
      name: "redux-reducer",
      fileExtensions: [
        "reducer.js",
        "reducers.js",
        "reducer.ts",
        "reducers.ts",
      ],
      fileNames: ["reducer.js", "reducers.js", "reducer.ts", "reducers.ts"],
    },
    {
      name: "redux-selector",
      fileExtensions: [
        "selector.js",
        "selectors.js",
        "selector.ts",
        "selectors.ts",
      ],
      fileNames: ["selector.js", "selectors.js", "selector.ts", "selectors.ts"],
    },
    {
      name: "redux-store",
      fileExtensions: ["store.js", "store.ts"],
      fileNames: ["store.js", "store.ts"],
    },
    {
      name: "settings",
      fileExtensions: [
        "ini",
        "dlc",
        "dll",
        "config",
        "conf",
        "properties",
        "prop",
        "settings",
        "option",
        "props",
        "toml",
        "prefs",
        "sln.dotsettings",
        "sln.dotsettings.user",
        "cfg",
      ],
      fileNames: [
        ".jshintignore",
        ".buildignore",
        ".mrconfig",
        ".yardopts",
        "manifest.mf",
        ".clang-format",
        ".clang-tidy",
      ],
    },
    {
      name: "typescript-def",
      fileExtensions: ["d.ts"],
    },
    {
      name: "markojs",
      fileExtensions: ["marko"],
    },
    {
      name: "astro",
      fileExtensions: ["astro"],
      fileNames: ["astro.config.js", "astro.config.mjs", "astro.config.cjs"],
    },
    {
      name: "pdf",
      fileExtensions: ["pdf"],
    },
    {
      name: "table",
      fileExtensions: ["xlsx", "xls", "csv", "tsv"],
    },
    {
      name: "vscode",
      fileExtensions: [
        "vscodeignore",
        "vsixmanifest",
        "vsix",
        "code-workplace",
      ],
    },
    {
      name: "visualstudio",
      fileExtensions: [
        "csproj",
        "ruleset",
        "sln",
        "suo",
        "vb",
        "vbs",
        "vcxitems",
        "vcxitems.filters",
        "vcxproj",
        "vcxproj.filters",
      ],
    },
    {
      name: "database",
      fileExtensions: [
        "pdb",
        "sql",
        "pks",
        "pkb",
        "accdb",
        "mdb",
        "sqlite",
        "sqlite3",
        "pgsql",
        "postgres",
        "psql",
        "db",
        "db3",
      ],
    },
    {
      name: "kusto",
      fileExtensions: ["kql"],
    },
    {
      name: "csharp",
      fileExtensions: ["cs", "csx"],
    },
    {
      name: "qsharp",
      fileExtensions: ["qs"],
    },
    {
      name: "zip",
      fileExtensions: [
        "zip",
        "tar",
        "gz",
        "xz",
        "br",
        "bzip2",
        "gzip",
        "brotli",
        "7z",
        "rar",
        "tgz",
      ],
    },
    {
      name: "vala",
      fileExtensions: ["vala"],
    },
    {
      name: "zig",
      fileExtensions: ["zig"],
    },
    {
      name: "exe",
      fileExtensions: ["exe", "msi"],
    },
    {
      name: "hex",
      fileExtensions: ["dat", "bin", "hex"],
    },
    {
      name: "java",
      fileExtensions: ["java", "jsp"],
    },
    {
      name: "jar",
      fileExtensions: ["jar"],
    },
    {
      name: "javaclass",
      fileExtensions: ["class"],
    },
    {
      name: "c",
      fileExtensions: ["c", "i", "mi"],
    },
    {
      name: "h",
      fileExtensions: ["h"],
    },
    {
      name: "cpp",
      fileExtensions: ["cc", "cpp", "cxx", "c++", "cp", "mm", "mii", "ii"],
    },
    {
      name: "hpp",
      fileExtensions: ["hh", "hpp", "hxx", "h++", "hp", "tcc", "inl"],
    },
    {
      name: "go",
      fileExtensions: ["go"],
    },
    {
      name: "go-mod",
      fileNames: ["go.mod", "go.sum"],
    },
    {
      name: "python",
      fileExtensions: ["py"],
    },
    {
      name: "python-misc",
      fileExtensions: ["pyc", "whl"],
      fileNames: [
        "requirements.txt",
        "pipfile",
        ".python-version",
        "manifest.in",
        "pylintrc",
        ".pylintrc",
      ],
    },
    {
      name: "url",
      fileExtensions: ["url"],
    },
    {
      name: "console",
      fileExtensions: [
        "sh",
        "ksh",
        "csh",
        "tcsh",
        "zsh",
        "bash",
        "bat",
        "cmd",
        "awk",
        "fish",
        "exp",
      ],
      fileNames: ["pre-commit", "pre-push", "post-merge"],
    },
    {
      name: "powershell",
      fileExtensions: ["ps1", "psm1", "psd1", "ps1xml", "psc1", "pssc"],
    },
    {
      name: "gradle",
      fileExtensions: ["gradle"],
      fileNames: ["gradle.properties", "gradlew", "gradle-wrapper.properties"],
    },
    {
      name: "word",
      fileExtensions: ["doc", "docx", "rtf"],
    },
    {
      name: "certificate",
      fileExtensions: ["cer", "cert", "crt"],
      fileNames: [
        "copying",
        "copying.md",
        "copying.txt",
        "copyright",
        "copyright.txt",
        "copyright.md",
        "license",
        "license.md",
        "license.txt",
        "licence",
        "licence.md",
        "licence.txt",
      ],
    },
    {
      name: "key",
      fileExtensions: ["pub", "key", "pem", "asc", "gpg", "passwd"],
      fileNames: [".htpasswd"],
    },
    {
      name: "font",
      fileExtensions: [
        "woff",
        "woff2",
        "ttf",
        "eot",
        "suit",
        "otf",
        "bmap",
        "fnt",
        "odttf",
        "ttc",
        "font",
        "fonts",
        "sui",
        "ntf",
        "mrf",
      ],
    },
    {
      name: "lib",
      fileExtensions: ["lib", "bib"],
    },
    {
      name: "ruby",
      fileExtensions: ["rb", "erb"],
    },
    {
      name: "gemfile",
      fileNames: ["gemfile"],
    },
    {
      name: "rubocop",
      fileNames: [".rubocop.yml", ".rubocop-todo.yml", ".rubocop_todo.yml"],
      light: true,
    },
    {
      name: "fsharp",
      fileExtensions: ["fs", "fsx", "fsi", "fsproj"],
    },
    {
      name: "swift",
      fileExtensions: ["swift"],
    },
    {
      name: "arduino",
      fileExtensions: ["ino"],
    },
    {
      name: "docker",
      fileExtensions: ["dockerignore", "dockerfile"],
      fileNames: [
        "dockerfile",
        "dockerfile.prod",
        "dockerfile.production",
        "dockerfile.alpha",
        "dockerfile.beta",
        "dockerfile.stage",
        "dockerfile.staging",
        "dockerfile.dev",
        "dockerfile.development",
        "dockerfile.local",
        "dockerfile.test",
        "dockerfile.testing",
        "dockerfile.ci",
        "dockerfile.web",
        "dockerfile.worker",
        "docker-compose.yml",
        "docker-compose.override.yml",
        "docker-compose.prod.yml",
        "docker-compose.production.yml",
        "docker-compose.alpha.yml",
        "docker-compose.beta.yml",
        "docker-compose.stage.yml",
        "docker-compose.staging.yml",
        "docker-compose.dev.yml",
        "docker-compose.development.yml",
        "docker-compose.local.yml",
        "docker-compose.test.yml",
        "docker-compose.testing.yml",
        "docker-compose.ci.yml",
        "docker-compose.web.yml",
        "docker-compose.worker.yml",
        "docker-compose.yaml",
        "docker-compose.override.yaml",
        "docker-compose.prod.yaml",
        "docker-compose.production.yaml",
        "docker-compose.alpha.yaml",
        "docker-compose.beta.yaml",
        "docker-compose.stage.yaml",
        "docker-compose.staging.yaml",
        "docker-compose.dev.yaml",
        "docker-compose.development.yaml",
        "docker-compose.local.yaml",
        "docker-compose.test.yaml",
        "docker-compose.testing.yaml",
        "docker-compose.ci.yaml",
        "docker-compose.web.yaml",
        "docker-compose.worker.yaml",
      ],
    },
    {
      name: "tex",
      fileExtensions: ["tex", "sty", "dtx", "ltx"],
    },
    {
      name: "powerpoint",
      fileExtensions: [
        "pptx",
        "ppt",
        "pptm",
        "potx",
        "potm",
        "ppsx",
        "ppsm",
        "pps",
        "ppam",
        "ppa",
      ],
    },
    {
      name: "video",
      fileExtensions: [
        "webm",
        "mkv",
        "flv",
        "vob",
        "ogv",
        "ogg",
        "gifv",
        "avi",
        "mov",
        "qt",
        "wmv",
        "yuv",
        "rm",
        "rmvb",
        "mp4",
        "m4v",
        "mpg",
        "mp2",
        "mpeg",
        "mpe",
        "mpv",
        "m2v",
      ],
    },
    {
      name: "virtual",
      fileExtensions: ["vdi", "vbox", "vbox-prev"],
    },
    {
      name: "email",
      fileExtensions: ["ics"],
      fileNames: [".mailmap"],
    },
    {
      name: "audio",
      fileExtensions: ["mp3", "flac", "m4a", "wma", "aiff", "wav"],
    },
    {
      name: "coffee",
      fileExtensions: ["coffee", "cson", "iced"],
    },
    {
      name: "document",
      fileExtensions: ["txt"],
    },
    {
      name: "graphql",
      fileExtensions: ["graphql", "gql"],
      fileNames: [
        ".graphqlconfig",
        ".graphqlrc",
        ".graphqlrc.json",
        ".graphqlrc.js",
        ".graphqlrc.ts",
        ".graphqlrc.toml",
        ".graphqlrc.yaml",
        ".graphqlrc.yml",
        "graphql.config.json",
        "graphql.config.js",
        "graphql.config.ts",
        "graphql.config.toml",
        "graphql.config.yaml",
        "graphql.config.yml",
      ],
    },
    {
      name: "rust",
      fileExtensions: ["rs"],
    },
    {
      name: "raml",
      fileExtensions: ["raml"],
    },
    {
      name: "xaml",
      fileExtensions: ["xaml"],
    },
    {
      name: "haskell",
      fileExtensions: ["hs"],
    },
    {
      name: "kotlin",
      fileExtensions: ["kt", "kts"],
    },
    {
      name: "git",
      fileExtensions: ["patch"],
      fileNames: [
        ".gitignore",
        ".gitignore_global",
        ".gitconfig",
        ".gitattributes",
        ".gitmodules",
        ".gitkeep",
        ".gitinclude",
        "git-history",
      ],
    },
    {
      name: "lua",
      fileExtensions: ["lua"],
      fileNames: [".luacheckrc"],
    },
    {
      name: "clojure",
      fileExtensions: ["clj", "cljs", "cljc"],
    },
    {
      name: "groovy",
      fileExtensions: ["groovy"],
    },
    {
      name: "r",
      fileExtensions: ["r", "rmd"],
      fileNames: [".Rhistory"],
    },
    {
      name: "dart",
      fileExtensions: ["dart"],
      fileNames: [".pubignore"],
    },
    {
      name: "actionscript",
      fileExtensions: ["as"],
    },
    {
      name: "mxml",
      fileExtensions: ["mxml"],
    },
    {
      name: "autohotkey",
      fileExtensions: ["ahk"],
    },
    {
      name: "flash",
      fileExtensions: ["swf"],
    },
    {
      name: "swc",
      fileExtensions: ["swc"],
    },
    {
      name: "cmake",
      fileExtensions: ["cmake"],
      fileNames: ["cmakelists.txt", "cmakecache.txt"],
    },
    {
      name: "assembly",
      fileExtensions: [
        "asm",
        "a51",
        "inc",
        "nasm",
        "s",
        "ms",
        "agc",
        "ags",
        "aea",
        "argus",
        "mitigus",
        "binsource",
      ],
    },
    {
      name: "vue",
      fileExtensions: ["vue"],
    },
    {
      name: "vue-config",
      fileNames: [
        "vue.config.js",
        "vue.config.ts",
        "vetur.config.js",
        "vetur.config.ts",
      ],
    },
    {
      name: "vuex-store",
      fileExtensions: ["store.js", "store.ts"],
      fileNames: ["store.js", "store.ts"],
    },
    {
      name: "nuxt",
      fileNames: ["nuxt.config.js", "nuxt.config.ts"],
      light: true,
    },
    {
      name: "ocaml",
      fileExtensions: ["ml", "mli", "cmx"],
    },
    {
      name: "odin",
      fileExtensions: ["odin"],
    },
    {
      name: "javascript-map",
      fileExtensions: ["js.map", "mjs.map", "cjs.map"],
    },
    {
      name: "css-map",
      fileExtensions: ["css.map"],
    },
    {
      name: "lock",
      fileExtensions: ["lock"],
      fileNames: ["security.md", "security.txt", "security"],
    },
    {
      name: "handlebars",
      fileExtensions: ["hbs", "mustache"],
    },
    {
      name: "perl",
      fileExtensions: ["pm", "raku"],
    },
    {
      name: "haxe",
      fileExtensions: ["hx"],
    },
    {
      name: "test-ts",
      fileExtensions: ["spec.ts", "e2e-spec.ts", "test.ts", "ts.snap"],
    },
    {
      name: "test-jsx",
      fileExtensions: [
        "spec.tsx",
        "test.tsx",
        "tsx.snap",
        "spec.jsx",
        "test.jsx",
        "jsx.snap",
      ],
    },
    {
      name: "test-js",
      fileExtensions: [
        "spec.js",
        "spec.cjs",
        "spec.mjs",
        "e2e-spec.js",
        "e2e-spec.cjs",
        "e2e-spec.mjs",
        "test.js",
        "test.cjs",
        "test.mjs",
        "js.snap",
      ],
    },
    {
      name: "angular",
      fileExtensions: ["module.ts", "module.js", "ng-template"],
      fileNames: ["angular-cli.json", ".angular-cli.json", "angular.json"],
    },
    {
      name: "angular-component",
      fileExtensions: ["component.ts", "component.js"],
    },
    {
      name: "angular-guard",
      fileExtensions: ["guard.ts", "guard.js"],
    },
    {
      name: "angular-service",
      fileExtensions: ["service.ts", "service.js"],
    },
    {
      name: "angular-pipe",
      fileExtensions: ["pipe.ts", "pipe.js", "filter.js"],
    },
    {
      name: "angular-directive",
      fileExtensions: ["directive.ts", "directive.js"],
    },
    {
      name: "angular-resolver",
      fileExtensions: ["resolver.ts", "resolver.js"],
    },
    {
      name: "puppet",
      fileExtensions: ["pp"],
    },
    {
      name: "elixir",
      fileExtensions: ["ex", "exs", "eex", "leex", "heex"],
    },
    {
      name: "livescript",
      fileExtensions: ["ls"],
    },
    {
      name: "erlang",
      fileExtensions: ["erl"],
    },
    {
      name: "twig",
      fileExtensions: ["twig"],
    },
    {
      name: "julia",
      fileExtensions: ["jl"],
    },
    {
      name: "elm",
      fileExtensions: ["elm"],
    },
    {
      name: "purescript",
      fileExtensions: ["pure", "purs"],
    },
    {
      name: "smarty",
      fileExtensions: ["tpl"],
    },
    {
      name: "stylus",
      fileExtensions: ["styl"],
    },
    {
      name: "reason",
      fileExtensions: ["re", "rei"],
    },
    {
      name: "bucklescript",
      fileExtensions: ["cmj"],
    },
    {
      name: "merlin",
      fileExtensions: ["merlin"],
    },
    {
      name: "verilog",
      fileExtensions: ["vhd", "sv", "svh"],
    },
    {
      name: "mathematica",
      fileExtensions: ["nb"],
    },
    {
      name: "wolframlanguage",
      fileExtensions: ["wl", "wls"],
    },
    {
      name: "nunjucks",
      fileExtensions: ["njk", "nunjucks"],
    },
    {
      name: "robot",
      fileExtensions: ["robot"],
    },
    {
      name: "solidity",
      fileExtensions: ["sol"],
    },
    {
      name: "autoit",
      fileExtensions: ["au3"],
    },
    {
      name: "haml",
      fileExtensions: ["haml"],
    },
    {
      name: "yang",
      fileExtensions: ["yang"],
    },
    {
      name: "mjml",
      fileExtensions: ["mjml"],
      fileNames: [".mjmlconfig"],
    },
    {
      name: "vercel",
      fileNames: ["vercel.json", ".vercelignore", "now.json", ".nowignore"],
      light: true,
    },
    {
      name: "next",
      fileNames: ["next.config.js", "next.config.ts", "next.config.mjs"],
      light: true,
    },
    {
      name: "remix",
      fileNames: ["remix.config.js", "remix.config.ts"],
      light: true,
    },
    {
      name: "terraform",
      fileExtensions: ["tf", "tf.json", "tfvars", "tfstate"],
    },
    {
      name: "laravel",
      fileExtensions: ["blade.php", "inky.php"],
      fileNames: ["artisan"],
    },
    {
      name: "applescript",
      fileExtensions: ["applescript", "ipa"],
    },
    {
      name: "cake",
      fileExtensions: ["cake"],
    },
    {
      name: "cucumber",
      fileExtensions: ["feature"],
    },
    {
      name: "nim",
      fileExtensions: ["nim", "nimble"],
    },
    {
      name: "apiblueprint",
      fileExtensions: ["apib", "apiblueprint"],
    },
    {
      name: "riot",
      fileExtensions: ["riot", "tag"],
    },
    {
      name: "vfl",
      fileExtensions: ["vfl"],
      fileNames: [".vfl"],
    },
    {
      name: "kl",
      fileExtensions: ["kl"],
      fileNames: [".kl"],
    },
    {
      name: "postcss",
      fileExtensions: ["pcss", "sss"],
      fileNames: [
        "postcss.config.js",
        "postcss.config.cjs",
        ".postcssrc.js",
        ".postcssrc",
        ".postcssrc.json",
        ".postcssrc.yml",
      ],
    },
    {
      name: "posthtml",
      fileNames: [
        "posthtml.config.js",
        ".posthtmlrc.js",
        ".posthtmlrc",
        ".posthtmlrc.json",
        ".posthtmlrc.yml",
      ],
    },
    {
      name: "todo",
      fileExtensions: ["todo"],
    },
    {
      name: "coldfusion",
      fileExtensions: ["cfml", "cfc", "lucee", "cfm"],
    },
    {
      name: "cabal",
      fileExtensions: ["cabal"],
      fileNames: [
        "cabal.project",
        "cabal.project.freeze",
        "cabal.project.local",
      ],
    },
    {
      name: "nix",
      fileExtensions: ["nix"],
    },
    {
      name: "slim",
      fileExtensions: ["slim"],
    },
    {
      name: "http",
      fileExtensions: ["http", "rest"],
      fileNames: ["CNAME"],
    },
    {
      name: "restql",
      fileExtensions: ["rql", "restql"],
    },
    {
      name: "kivy",
      fileExtensions: ["kv"],
    },
    {
      name: "graphcool",
      fileExtensions: ["graphcool"],
      fileNames: ["project.graphcool"],
    },
    {
      name: "sbt",
      fileExtensions: ["sbt"],
    },
    {
      name: "webpack",
      fileNames: [
        "webpack.js",
        "webpack.cjs",
        "webpack.ts",
        "webpack.base.js",
        "webpack.base.cjs",
        "webpack.base.ts",
        "webpack.config.js",
        "webpack.config.cjs",
        "webpack.config.ts",
        "webpack.common.js",
        "webpack.common.cjs",
        "webpack.common.ts",
        "webpack.config.common.js",
        "webpack.config.common.cjs",
        "webpack.config.common.ts",
        "webpack.config.common.babel.js",
        "webpack.config.common.babel.ts",
        "webpack.dev.js",
        "webpack.dev.cjs",
        "webpack.dev.ts",
        "webpack.development.js",
        "webpack.development.cjs",
        "webpack.development.ts",
        "webpack.config.dev.js",
        "webpack.config.dev.cjs",
        "webpack.config.dev.ts",
        "webpack.config.dev.babel.js",
        "webpack.config.dev.babel.ts",
        "webpack.mix.js",
        "webpack.mix.cjs",
        "webpack.prod.js",
        "webpack.prod.cjs",
        "webpack.prod.config.js",
        "webpack.prod.config.cjs",
        "webpack.prod.ts",
        "webpack.production.js",
        "webpack.production.cjs",
        "webpack.production.ts",
        "webpack.server.js",
        "webpack.server.cjs",
        "webpack.server.ts",
        "webpack.client.js",
        "webpack.client.cjs",
        "webpack.client.ts",
        "webpack.config.server.js",
        "webpack.config.server.cjs",
        "webpack.config.server.ts",
        "webpack.config.client.js",
        "webpack.config.client.cjs",
        "webpack.config.client.ts",
        "webpack.config.production.babel.js",
        "webpack.config.production.babel.ts",
        "webpack.config.prod.babel.js",
        "webpack.config.prod.babel.cjs",
        "webpack.config.prod.babel.ts",
        "webpack.config.prod.js",
        "webpack.config.prod.cjs",
        "webpack.config.prod.ts",
        "webpack.config.production.js",
        "webpack.config.production.cjs",
        "webpack.config.production.ts",
        "webpack.config.staging.js",
        "webpack.config.staging.cjs",
        "webpack.config.staging.ts",
        "webpack.config.babel.js",
        "webpack.config.babel.ts",
        "webpack.config.base.babel.js",
        "webpack.config.base.babel.ts",
        "webpack.config.base.js",
        "webpack.config.base.cjs",
        "webpack.config.base.ts",
        "webpack.config.staging.babel.js",
        "webpack.config.staging.babel.ts",
        "webpack.config.coffee",
        "webpack.config.test.js",
        "webpack.config.test.cjs",
        "webpack.config.test.ts",
        "webpack.config.vendor.js",
        "webpack.config.vendor.cjs",
        "webpack.config.vendor.ts",
        "webpack.config.vendor.production.js",
        "webpack.config.vendor.production.cjs",
        "webpack.config.vendor.production.ts",
        "webpack.test.js",
        "webpack.test.cjs",
        "webpack.test.ts",
        "webpack.dist.js",
        "webpack.dist.cjs",
        "webpack.dist.ts",
        "webpackfile.js",
        "webpackfile.cjs",
        "webpackfile.ts",
      ],
    },
    {
      name: "ionic",
      fileNames: ["ionic.config.json", ".io-config.json"],
    },
    {
      name: "gulp",
      fileNames: [
        "gulpfile.js",
        "gulpfile.mjs",
        "gulpfile.ts",
        "gulpfile.babel.js",
      ],
    },
    {
      name: "nodejs",
      fileNames: [
        "package.json",
        "package-lock.json",
        ".nvmrc",
        ".esmrc",
        ".node-version",
      ],
    },
    {
      name: "npm",
      fileNames: [".npmignore", ".npmrc"],
    },
    {
      name: "yarn",
      fileNames: [
        ".yarnrc",
        "yarn.lock",
        ".yarnclean",
        ".yarn-integrity",
        "yarn-error.log",
        ".yarnrc.yml",
        ".yarnrc.yaml",
      ],
    },
    {
      name: "android",
      fileNames: ["androidmanifest.xml"],
      fileExtensions: ["apk", "smali", "dex"],
    },
    {
      name: "tune",
      fileExtensions: ["env"],
      fileNames: [
        ".env.defaults",
        ".env.example",
        ".env.sample",
        ".env.template",
        ".env.schema",
        ".env.local",
        ".env.dev",
        ".env.development",
        ".env.qa",
        ".env.dist",
        ".env.prod",
        ".env.production",
        ".env.stage",
        ".env.staging",
        ".env.preview",
        ".env.test",
        ".env.testing",
        ".env.development.local",
        ".env.qa.local",
        ".env.production.local",
        ".env.staging.local",
        ".env.test.local",
      ],
    },
    {
      name: "babel",
      fileNames: [
        ".babelrc",
        ".babelrc.cjs",
        ".babelrc.js",
        ".babelrc.mjs",
        ".babelrc.json",
        "babel.config.cjs",
        "babel.config.js",
        "babel.config.mjs",
        "babel.config.json",
        "babel-transform.js",
        ".babel-plugin-macrosrc",
        ".babel-plugin-macrosrc.json",
        ".babel-plugin-macrosrc.yaml",
        ".babel-plugin-macrosrc.yml",
        ".babel-plugin-macrosrc.js",
        "babel-plugin-macros.config.js",
      ],
    },
    {
      name: "blitz",
      fileNames: [
        "blitz.config.js",
        "blitz.config.ts",
        ".blitz.config.compiled.js",
      ],
    },
    {
      name: "contributing",
      fileNames: ["contributing.md"],
    },
    {
      name: "readme",
      fileNames: ["readme.md", "readme.txt", "readme"],
    },
    {
      name: "changelog",
      fileNames: [
        "changelog",
        "changelog.md",
        "changelog.txt",
        "changes",
        "changes.md",
        "changes.txt",
      ],
    },
    {
      name: "credits",
      fileNames: ["credits", "credits.txt", "credits.md"],
    },
    {
      name: "authors",
      fileNames: ["authors", "authors.md", "authors.txt"],
    },
    {
      name: "flow",
      fileNames: [".flowconfig"],
    },
    {
      name: "favicon",
      fileNames: ["favicon.ico"],
    },
    {
      name: "karma",
      fileNames: [
        "karma.conf.js",
        "karma.conf.ts",
        "karma.conf.coffee",
        "karma.config.js",
        "karma.config.ts",
        "karma-main.js",
        "karma-main.ts",
      ],
    },
    {
      name: "bithound",
      fileNames: [".bithoundrc"],
    },
    {
      name: "svgo",
      fileNames: ["svgo.config.js"],
    },
    {
      name: "appveyor",
      fileNames: [".appveyor.yml", "appveyor.yml"],
    },
    {
      name: "travis",
      fileNames: [".travis.yml"],
    },
    {
      name: "codecov",
      fileNames: [".codecov.yml", "codecov.yml"],
    },
    {
      name: "protractor",
      fileNames: [
        "protractor.conf.js",
        "protractor.conf.ts",
        "protractor.conf.coffee",
        "protractor.config.js",
        "protractor.config.ts",
      ],
    },
    {
      name: "fusebox",
      fileNames: ["fuse.js"],
    },
    {
      name: "heroku",
      fileNames: ["procfile", "procfile.windows"],
    },
    {
      name: "editorconfig",
      fileNames: [".editorconfig"],
    },
    {
      name: "gitlab",
      fileExtensions: ["gitlab-ci.yml"],
    },
    {
      name: "bower",
      fileNames: [".bowerrc", "bower.json"],
    },
    {
      name: "eslint",
      fileNames: [
        ".eslintrc.js",
        ".eslintrc.cjs",
        ".eslintrc.yaml",
        ".eslintrc.yml",
        ".eslintrc.json",
        ".eslintrc-md.js",
        ".eslintrc-jsdoc.js",
        ".eslintrc",
        ".eslintignore",
        ".eslintcache",
      ],
    },
    {
      name: "conduct",
      fileNames: ["code_of_conduct.md", "code_of_conduct.txt"],
    },
    {
      name: "watchman",
      fileNames: [".watchmanconfig"],
    },
    {
      name: "aurelia",
      fileNames: ["aurelia.json"],
    },
    {
      name: "mocha",
      fileNames: [
        "mocha.opts",
        ".mocharc.yml",
        ".mocharc.yaml",
        ".mocharc.js",
        ".mocharc.json",
        ".mocharc.jsonc",
      ],
    },
    {
      name: "jenkins",
      fileNames: ["jenkinsfile"],
      fileExtensions: ["jenkinsfile", "jenkins"],
    },
    {
      name: "firebase",
      fileNames: [
        "firebase.json",
        ".firebaserc",
        "firestore.rules",
        "firestore.indexes.json",
      ],
    },
    {
      name: "figma",
      fileExtensions: ["fig"],
    },
    {
      name: "rollup",
      fileNames: [
        "rollup.config.js",
        "rollup.config.ts",
        "rollup-config.js",
        "rollup-config.ts",
        "rollup.config.common.js",
        "rollup.config.common.ts",
        "rollup.config.base.js",
        "rollup.config.base.ts",
        "rollup.config.prod.js",
        "rollup.config.prod.ts",
        "rollup.config.dev.js",
        "rollup.config.dev.ts",
        "rollup.config.prod.vendor.js",
        "rollup.config.prod.vendor.ts",
      ],
    },
    {
      name: "hack",
      fileNames: [".hhconfig"],
    },
    {
      name: "stylelint",
      fileNames: [
        ".stylelintrc",
        "stylelint.config.js",
        "stylelint.config.cjs",
        ".stylelintrc.json",
        ".stylelintrc.yaml",
        ".stylelintrc.yml",
        ".stylelintrc.js",
        ".stylelintrc.cjs",
        ".stylelintignore",
      ],
      light: true,
    },
    {
      name: "code-climate",
      fileNames: [".codeclimate.yml"],
      light: true,
    },
    {
      name: "prettier",
      fileNames: [
        ".prettierrc",
        "prettier.config.js",
        "prettier.config.cjs",
        ".prettierrc.js",
        ".prettierrc.cjs",
        ".prettierrc.json",
        ".prettierrc.json5",
        ".prettierrc.yaml",
        ".prettierrc.yml",
        ".prettierignore",
        ".prettierrc.toml",
      ],
    },
    {
      name: "renovate",
      fileNames: [
        ".renovaterc",
        ".renovaterc.json",
        "renovate-config.json",
        "renovate.json",
        "renovate.json5",
      ],
    },
    {
      name: "apollo",
      fileNames: ["apollo.config.js"],
    },
    {
      name: "nodemon",
      fileNames: ["nodemon.json", "nodemon-debug.json"],
    },
    {
      name: "ngrx-reducer",
      fileExtensions: ["reducer.ts", "rootReducer.ts"],
    },
    {
      name: "ngrx-state",
      fileExtensions: ["state.ts"],
    },
    {
      name: "ngrx-actions",
      fileExtensions: ["actions.ts"],
    },
    {
      name: "ngrx-effects",
      fileExtensions: ["effects.ts"],
    },
    {
      name: "ngrx-entity",
      fileNames: [".entity"],
    },
    {
      name: "ngrx-selectors",
      fileExtensions: ["selectors.ts"],
    },
    {
      name: "webhint",
      fileNames: [".hintrc"],
    },
    {
      name: "browserlist",
      fileNames: ["browserslist", ".browserslistrc"],
      light: true,
    },
    {
      name: "crystal",
      fileExtensions: ["cr", "ecr"],
      light: true,
    },
    {
      name: "snyk",
      fileNames: [".snyk"],
    },
    {
      name: "drone",
      fileExtensions: ["drone.yml"],
      fileNames: [".drone.yml"],
      light: true,
    },
    {
      name: "cuda",
      fileExtensions: ["cu", "cuh"],
    },
    {
      name: "log",
      fileExtensions: ["log"],
    },
    {
      name: "dotjs",
      fileExtensions: ["def", "dot", "jst"],
    },
    {
      name: "ejs",
      fileExtensions: ["ejs"],
    },
    {
      name: "sequelize",
      fileNames: [".sequelizerc"],
    },
    {
      name: "gatsby",
      fileNames: [
        "gatsby.config.js",
        "gatsby-config.js",
        "gatsby-node.js",
        "gatsby-browser.js",
        "gatsby-ssr.js",
      ],
    },
    {
      name: "wakatime",
      fileNames: [".wakatime-project"],
      fileExtensions: [".wakatime-project"],
      light: true,
    },
    {
      name: "circleci",
      fileNames: ["circle.yml"],
      light: true,
    },
    {
      name: "cloudfoundry",
      fileNames: [".cfignore"],
    },
    {
      name: "grunt",
      fileNames: [
        "gruntfile.js",
        "gruntfile.ts",
        "gruntfile.coffee",
        "gruntfile.babel.js",
        "gruntfile.babel.ts",
        "gruntfile.babel.coffee",
      ],
    },
    {
      name: "jest",
      fileNames: [
        "jest.config.js",
        "jest.config.ts",
        "jest.config.cjs",
        "jest.config.mjs",
        "jest.config.json",
        "jest.e2e.config.js",
        "jest.e2e.config.ts",
        "jest.e2e.config.cjs",
        "jest.e2e.config.mjs",
        "jest.e2e.config.json",
        "jest.e2e.json",
        "jest-unit.config.js",
        "jest-e2e.config.js",
        "jest-e2e.config.ts",
        "jest-e2e.config.cjs",
        "jest-e2e.config.mjs",
        "jest-e2e.config.json",
        "jest-e2e.json",
        "jest-github-actions-reporter.js",
        "jest.setup.js",
        "jest.setup.ts",
        "jest.json",
        ".jestrc",
        ".jestrc.js",
        ".jestrc.json",
        "jest.teardown.js",
      ],
    },
    {
      name: "processing",
      fileExtensions: ["pde"],
      light: true,
    },
    {
      name: "storybook",
      fileExtensions: [
        "stories.js",
        "stories.jsx",
        "stories.mdx",
        "story.js",
        "story.jsx",
        "stories.ts",
        "stories.tsx",
        "story.ts",
        "story.tsx",
        "stories.svelte",
        "story.mdx",
      ],
    },
    {
      name: "wepy",
      fileExtensions: ["wpy"],
    },
    {
      name: "fastlane",
      fileNames: ["fastfile", "appfile"],
    },
    {
      name: "hcl",
      fileExtensions: ["hcl"],
      light: true,
    },
    {
      name: "helm",
      fileNames: [".helmignore"],
    },
    {
      name: "san",
      fileExtensions: ["san"],
    },
    {
      name: "wallaby",
      fileNames: ["wallaby.js", "wallaby.conf.js"],
    },
    {
      name: "django",
      fileExtensions: ["djt"],
    },
    {
      name: "stencil",
      fileNames: ["stencil.config.js", "stencil.config.ts"],
    },
    {
      name: "red",
      fileExtensions: ["red"],
    },
    {
      name: "makefile",
      fileNames: ["makefile"],
    },
    {
      name: "foxpro",
      fileExtensions: ["fxp", "prg"],
    },
    {
      name: "i18n",
      fileExtensions: ["pot", "po", "mo"],
    },
    {
      name: "webassembly",
      fileExtensions: ["wat", "wasm"],
    },
    {
      name: "semantic-release",
      light: true,
      fileNames: [
        ".releaserc",
        ".releaserc.yaml",
        ".releaserc.yml",
        ".releaserc.json",
        ".releaserc.js",
        "release.config.js",
      ],
    },
    {
      name: "bitbucket",
      fileNames: ["bitbucket-pipelines.yaml", "bitbucket-pipelines.yml"],
    },
    {
      name: "jupyter",
      fileExtensions: ["ipynb"],
    },
    {
      name: "d",
      fileExtensions: ["d"],
    },
    {
      name: "mdx",
      fileExtensions: ["mdx"],
    },
    {
      name: "ballerina",
      fileExtensions: ["bal", "balx"],
    },
    {
      name: "racket",
      fileExtensions: ["rkt"],
    },
    {
      name: "bazel",
      fileExtensions: ["bzl", "bazel"],
      fileNames: [".bazelignore", ".bazelrc", ".bazelversion"],
    },
    {
      name: "mint",
      fileExtensions: ["mint"],
    },
    {
      name: "velocity",
      fileExtensions: ["vm", "fhtml", "vtl"],
    },
    {
      name: "godot",
      fileExtensions: ["gd"],
    },
    {
      name: "godot-assets",
      fileExtensions: ["godot", "tres", "tscn"],
    },
    {
      name: "azure-pipelines",
      fileNames: ["azure-pipelines.yml", "azure-pipelines.yaml"],
      fileExtensions: ["azure-pipelines.yml", "azure-pipelines.yaml"],
    },
    {
      name: "azure",
      fileExtensions: ["azcli"],
    },
    {
      name: "vagrant",
      fileNames: ["vagrantfile"],
      fileExtensions: ["vagrantfile"],
    },
    {
      name: "prisma",
      fileNames: ["prisma.yml"],
      fileExtensions: ["prisma"],
    },
    {
      name: "razor",
      fileExtensions: ["cshtml", "vbhtml"],
    },
    {
      name: "abc",
      fileExtensions: ["abc"],
    },
    {
      name: "asciidoc",
      fileExtensions: ["ad", "adoc", "asciidoc"],
    },
    {
      name: "istanbul",
      fileNames: [".nycrc", ".nycrc.json"],
    },
    {
      name: "edge",
      fileExtensions: ["edge"],
    },
    {
      name: "scheme",
      fileExtensions: ["ss", "scm"],
    },
    {
      name: "lisp",
      fileExtensions: ["lisp", "lsp", "cl", "fast"],
    },
    {
      name: "tailwindcss",
      fileNames: [
        "tailwind.js",
        "tailwind.ts",
        "tailwind.config.js",
        "tailwind.config.ts",
        "tailwind.config.cjs",
      ],
    },
    {
      name: "3d",
      fileExtensions: [
        "stl",
        "obj",
        "ac",
        "blend",
        "mesh",
        "mqo",
        "pmd",
        "pmx",
        "skp",
        "vac",
        "vdp",
        "vox",
      ],
    },
    {
      name: "buildkite",
      fileNames: ["buildkite.yml", "buildkite.yaml"],
    },
    {
      name: "netlify",
      fileNames: [
        "netlify.json",
        "netlify.yml",
        "netlify.yaml",
        "netlify.toml",
      ],
    },
    {
      name: "svg",
      fileExtensions: ["svg"],
    },
    {
      name: "svelte",
      fileExtensions: ["svelte"],
      fileNames: ["svelte.config.js", "svelte.config.cjs"],
    },
    {
      name: "vim",
      fileExtensions: ["vimrc", "gvimrc", "exrc", "vim", "viminfo"],
    },
    {
      name: "nest",
      fileNames: [
        "nest-cli.json",
        ".nest-cli.json",
        "nestconfig.json",
        ".nestconfig.json",
      ],
    },
    {
      name: "nest-controller",
      fileExtensions: ["controller.ts", "controller.js"],
    },
    {
      name: "nest-middleware",
      fileExtensions: ["middleware.ts", "middleware.js"],
    },
    {
      name: "nest-module",
      fileExtensions: ["module.ts", "module.js"],
    },
    {
      name: "nest-service",
      fileExtensions: ["service.ts", "service.js"],
    },
    {
      name: "nest-decorator",
      fileExtensions: ["decorator.ts", "decorator.js"],
    },
    {
      name: "nest-pipe",
      fileExtensions: ["pipe.ts", "pipe.js"],
    },
    {
      name: "nest-filter",
      fileExtensions: ["filter.ts", "filter.js"],
    },
    {
      name: "nest-gateway",
      fileExtensions: ["gateway.ts", "gateway.js"],
    },
    {
      name: "nest-guard",
      fileExtensions: ["guard.ts", "guard.js"],
    },
    {
      name: "nest-resolver",
      fileExtensions: ["resolver.ts", "resolver.js"],
    },
    {
      name: "moonscript",
      fileExtensions: ["moon"],
    },
    {
      name: "percy",
      fileNames: [".percy.yml"],
    },
    {
      name: "gitpod",
      fileNames: [".gitpod.yml"],
    },
    {
      name: "advpl_prw",
      fileExtensions: ["prw", "prx"],
    },
    {
      name: "advpl_ptm",
      fileExtensions: ["ptm"],
    },
    {
      name: "advpl_tlpp",
      fileExtensions: ["tlpp"],
    },
    {
      name: "advpl_include",
      fileExtensions: ["ch"],
    },
    {
      name: "codeowners",
      fileNames: ["codeowners"],
    },
    {
      name: "gcp",
      fileNames: [".gcloudignore"],
    },
    {
      name: "disc",
      fileExtensions: ["iso"],
    },
    {
      name: "fortran",
      fileExtensions: ["f", "f77", "f90", "f95", "f03", "f08"],
    },
    {
      name: "tcl",
      fileExtensions: ["tcl"],
    },
    {
      name: "liquid",
      fileExtensions: ["liquid"],
    },
    {
      name: "prolog",
      fileExtensions: ["p", "pro", "pl"],
    },
    {
      name: "husky",
      fileNames: [
        ".huskyrc",
        "husky.config.js",
        ".huskyrc.json",
        ".huskyrc.js",
        ".huskyrc.yaml",
        ".huskyrc.yml",
      ],
    },
    {
      name: "coconut",
      fileExtensions: ["coco"],
    },
    {
      name: "tilt",
      fileNames: ["tiltfile"],
    },
    {
      name: "capacitor",
      fileNames: ["capacitor.config.json"],
    },
    {
      name: "sketch",
      fileExtensions: ["sketch"],
    },
    {
      name: "pawn",
      fileExtensions: ["pwn", "amx"],
    },
    {
      name: "adonis",
      fileNames: [".adonisrc.json", "ace"],
    },
    {
      name: "forth",
      fileExtensions: ["4th", "fth", "frt"],
    },
    {
      name: "uml",
      fileExtensions: ["iuml", "pu", "puml", "plantuml", "wsd"],
      light: true,
    },
    {
      name: "meson",
      fileNames: ["meson.build", "meson_options.txt"],
      fileExtensions: ["wrap"],
    },
    {
      name: "commitlint",
      fileNames: [
        ".commitlintrc",
        ".commitlintrc.js",
        "commitlint.config.js",
        ".commitlintrc.json",
        ".commitlint.yaml",
        ".commitlint.yml",
        ".commitlintrc.yaml",
        ".commitlintrc.yml",
        "commitlint.config.cjs",
        "commitlint.config.ts",
        ".commitlintrc.ts",
        ".commitlintrc.cjs",
      ],
    },
    {
      name: "buck",
      fileNames: [".buckconfig"],
    },
    {
      name: "dhall",
      fileExtensions: ["dhall", "dhallb"],
    },
    {
      name: "sml",
      fileExtensions: [
        "sml",
        "mlton",
        "mlb",
        "sig",
        "fun",
        "cm",
        "lex",
        "use",
        "grm",
      ],
    },
    {
      name: "nrwl",
      fileNames: ["nx.json", ".nxignore"],
    },
    {
      name: "opam",
      fileExtensions: ["opam"],
    },
    {
      name: "dune",
      fileNames: [
        "dune",
        "dune-project",
        "dune-workspace",
        "dune-workspace.dev",
      ],
    },
    {
      name: "imba",
      fileExtensions: ["imba"],
    },
    {
      name: "drawio",
      fileExtensions: ["drawio", "dio"],
    },
    {
      name: "pascal",
      fileExtensions: ["pas"],
    },
    {
      name: "shaderlab",
      fileExtensions: ["unity"],
    },
    {
      name: "roadmap",
      fileNames: [
        "roadmap.md",
        "roadmap.txt",
        "timeline.md",
        "timeline.txt",
        "milestones.md",
        "milestones.txt",
      ],
    },
    {
      name: "sas",
      fileExtensions: ["sas", "sas7bdat", "sashdat", "astore", "ast", "sast"],
    },
    {
      name: "nuget",
      fileNames: ["nuget.config", ".nuspec", "nuget.exe"],
      fileExtensions: ["nupkg"],
    },
    {
      name: "command",
      fileExtensions: ["command"],
    },
    {
      name: "stryker",
      fileNames: ["stryker.conf.js", "stryker.conf.json"],
    },
    {
      name: "denizenscript",
      fileExtensions: ["dsc"],
    },
    {
      name: "modernizr",
      fileNames: [".modernizrrc", ".modernizrrc.js", ".modernizrrc.json"],
    },
    {
      name: "slug",
      fileNames: [".slugignore"],
    },
    {
      name: "search",
      fileExtensions: ["code-search"],
    },
    {
      name: "stitches",
      fileNames: ["stitches.config.js", "stitches.config.ts"],
      light: true,
    },
    {
      name: "nginx",
      fileNames: ["nginx.conf"],
    },
    {
      name: "minecraft",
      fileExtensions: [
        "mcfunction",
        "mcmeta",
        "mcr",
        "mca",
        "mcgame",
        "mclevel",
        "mcworld",
        "mine",
        "mus",
      ],
    },
    {
      name: "replit",
      fileNames: [".replit"],
    },
    {
      name: "rescript",
      fileExtensions: ["res", "resi"],
    },
    {
      name: "snowpack",
      fileNames: [
        "snowpack.config.cjs",
        "snowpack.config.js",
        "snowpack.config.mjs",
        "snowpack.deps.json",
        "snowpack.config.ts",
        "snowpack.config.json",
      ],
      light: true,
    },
    {
      name: "brainfuck",
      fileExtensions: ["b", "bf"],
    },
    {
      name: "bicep",
      fileExtensions: ["bicep"],
    },
    {
      name: "cobol",
      fileExtensions: ["cob", "cbl"],
    },
    {
      name: "grain",
      fileExtensions: ["gr"],
    },
    {
      name: "lolcode",
      fileExtensions: ["lol"],
    },
    {
      name: "idris",
      fileExtensions: ["idr", "ibc"],
    },
    {
      name: "quasar",
      fileNames: ["quasar.conf.js"],
    },
    {
      name: "dependabot",
      fileNames: ["dependabot.yml"],
    },
    {
      name: "pipeline",
      fileExtensions: ["pipeline"],
    },
    {
      name: "vite",
      fileNames: [
        "vite.config.js",
        "vite.config.mjs",
        "vite.config.cjs",
        "vite.config.ts",
      ],
    },
    {
      name: "opa",
      fileExtensions: ["rego"],
    },
    {
      name: "lerna",
      fileNames: ["lerna.json"],
    },
    {
      name: "windicss",
      fileNames: [
        "windi.config.js",
        "windi.config.ts",
        "windi.config.cjs",
        "windi.config.json",
      ],
      fileExtensions: ["windi"],
    },
    {
      name: "textlint",
      fileNames: [".textlintrc"],
    },
    {
      name: "scala",
      fileExtensions: ["scala", "sc"],
    },
    {
      name: "lilypond",
      fileExtensions: ["ly"],
    },
    {
      name: "vlang",
      fileExtensions: ["v"],
      fileNames: ["vpkg.json", "v.mod"],
    },
    {
      name: "chess",
      fileExtensions: ["pgn", "fen"],
      light: true,
    },
    {
      name: "gemini",
      fileExtensions: ["gmi", "gemini"],
    },
    {
      name: "sentry",
      fileNames: [".sentryclirc"],
    },
    {
      name: "phpunit",
      fileNames: [
        ".phpunit.result.cache",
        ".phpunit-watcher.yml",
        "phpunit.xml",
        "phpunit.xml.dist",
        "phpunit-watcher.yml",
        "phpunit-watcher.yml.dist",
      ],
    },
    {
      name: "php-cs-fixer",
      fileNames: [
        ".php_cs",
        ".php_cs.dist",
        ".php_cs.php",
        ".php_cs.dist.php",
        ".php-cs-fixer.php",
        ".php-cs-fixer.dist.php",
      ],
    },
    {
      name: "robots",
      fileNames: ["robots.txt"],
    },
    {
      name: "tsconfig",
      fileNames: [
        "tsconfig.json",
        "tsconfig.app.json",
        "tsconfig.editor.json",
        "tsconfig.spec.json",
        "tsconfig.base.json",
        "tsconfig.build.json",
        "tsconfig.eslint.json",
        "tsconfig.lib.json",
      ],
      fileExtensions: ["tsconfig.json"],
    },
    {
      name: "tauri",
      fileNames: [
        "tauri.config.json",
        "tauri.linux.conf.json",
        "tauri.windows.conf.json",
        "tauri.macos.conf.json",
      ],
      fileExtensions: ["tauri"],
    },
    {
      name: "jsconfig",
      fileNames: ["jsconfig.json"],
      fileExtensions: ["jsconfig.json"],
    },
    {
      name: "maven",
      fileNames: ["maven.config", "jvm.config"],
    },
    {
      name: "ada",
      fileExtensions: ["ada", "adb", "ads", "ali"],
    },
    {
      name: "serverless",
      fileNames: ["serverless.yml"],
    },
    {
      name: "ember",
      fileNames: [".ember-cli", ".ember-cli.js", "ember-cli-builds.js"],
    },
    {
      name: "horusec",
      fileNames: ["horusec-config.json"],
      fileExtensions: ["horusec-config.json"],
    },
    {
      name: "coala",
      fileExtensions: ["coarc", "coafile"],
    },
    {
      name: "dinophp",
      fileExtensions: ["bubble", "html.bubble", "php.bubble"],
    },
    {
      name: "teal",
      fileExtensions: ["tl"],
    },
    {
      name: "template",
      fileExtensions: ["template"],
    },
    {
      name: "astyle",
      fileNames: [".astylerc"],
    },
    {
      name: "lighthouse",
      fileNames: [
        ".lighthouserc.js",
        "lighthouserc.js",
        ".lighthouserc.json",
        "lighthouserc.json",
        ".lighthouserc.yml",
        "lighthouserc.yml",
        ".lighthouserc.yaml",
        "lighthouserc.yaml",
      ],
    },
    {
      name: "svgr",
      fileNames: [
        ".svgrrc",
        "svgr.config.js",
        ".svgrrc.js",
        ".svgrrc.yaml",
        ".svgrrc.yml",
        ".svgrrc.json",
      ],
    },
    {
      name: "rome",
      fileNames: ["rome.json"],
    },
    {
      name: "cypress",
      fileNames: ["cypress.json", "cypress.env.json"],
    },
    {
      name: "siyuan",
      fileExtensions: ["sy"],
    },
    {
      name: "ndst",
      fileExtensions: ["ndst.yml", "ndst.yaml", "ndst.json"],
    },
    {
      name: "tobi",
      fileExtensions: ["tobi"],
    },
    {
      name: "tobimake",
      fileNames: [".tobimake"],
    },
  ],
  folders: {
    name: "specific",
    defaultIcon: {
      name: "folder",
    },
    rootFolder: {
      name: "folder-root",
    },
    icons: [
      {
        name: "folder-src",
        folderNames: ["src", "source", "sources", "code"],
      },
      {
        name: "folder-dist",
        folderNames: ["dist", "out", "build", "release", "bin"],
      },
      {
        name: "folder-css",
        folderNames: ["css", "stylesheet", "stylesheets", "style", "styles"],
      },
      {
        name: "folder-sass",
        folderNames: ["sass", "_sass", "scss", "_scss"],
      },
      {
        name: "folder-images",
        folderNames: [
          "images",
          "image",
          "img",
          "icons",
          "icon",
          "ico",
          "screenshot",
          "screenshots",
          "picture",
          "pictures",
        ],
      },
      {
        name: "folder-scripts",
        folderNames: ["script", "scripts"],
      },
      {
        name: "folder-node",
        folderNames: ["node_modules"],
      },
      {
        name: "folder-javascript",
        folderNames: ["js", "javascript", "javascripts"],
      },
      {
        name: "folder-json",
        folderNames: ["json"],
      },
      {
        name: "folder-font",
        folderNames: ["font", "fonts"],
      },
      {
        name: "folder-bower",
        folderNames: ["bower_components"],
      },
      {
        name: "folder-test",
        folderNames: [
          "test",
          "tests",
          "testing",
          "__tests__",
          "__snapshots__",
          "__mocks__",
          "__test__",
          "spec",
          "specs",
        ],
      },
      {
        name: "folder-jinja",
        folderNames: ["jinja", "jinja2", "j2"],
        light: true,
      },
      {
        name: "folder-markdown",
        folderNames: ["markdown", "md"],
      },
      {
        name: "folder-php",
        folderNames: ["php"],
      },
      {
        name: "folder-phpmailer",
        folderNames: ["phpmailer"],
      },
      {
        name: "folder-sublime",
        folderNames: ["sublime"],
      },
      {
        name: "folder-docs",
        folderNames: [
          "doc",
          "docs",
          "document",
          "documents",
          "documentation",
          "post",
          "posts",
          "article",
          "articles",
        ],
      },
      {
        name: "folder-git",
        folderNames: [
          ".git",
          "patches",
          "githooks",
          ".githooks",
          "submodules",
          ".submodules",
        ],
      },
      {
        name: "folder-github",
        folderNames: [".github"],
      },
      {
        name: "folder-gitlab",
        folderNames: [".gitlab"],
      },
      {
        name: "folder-vscode",
        folderNames: [".vscode", ".vscode-test"],
      },
      {
        name: "folder-views",
        folderNames: [
          "view",
          "views",
          "screen",
          "screens",
          "page",
          "pages",
          "html",
        ],
      },
      {
        name: "folder-vue",
        folderNames: ["vue"],
      },
      {
        name: "folder-vuepress",
        folderNames: [".vuepress"],
      },
      {
        name: "folder-expo",
        folderNames: [".expo", ".expo-shared"],
      },
      {
        name: "folder-config",
        folderNames: [
          "config",
          "configs",
          "configuration",
          "configurations",
          "setting",
          ".setting",
          "settings",
          ".settings",
          "META-INF",
        ],
      },
      {
        name: "folder-i18n",
        folderNames: [
          "i18n",
          "internationalization",
          "lang",
          "language",
          "languages",
          "locale",
          "locales",
          "l10n",
          "localization",
          "translation",
          "translate",
          "translations",
          ".tx",
        ],
      },
      {
        name: "folder-components",
        folderNames: ["components", "widget", "widgets"],
      },
      {
        name: "folder-aurelia",
        folderNames: ["aurelia_project"],
      },
      {
        name: "folder-resource",
        folderNames: [
          "resource",
          "resources",
          "res",
          "asset",
          "assets",
          "static",
          "report",
          "reports",
        ],
      },
      {
        name: "folder-lib",
        folderNames: [
          "lib",
          "libs",
          "library",
          "libraries",
          "vendor",
          "vendors",
          "third-party",
        ],
      },
      {
        name: "folder-theme",
        folderNames: [
          "themes",
          "theme",
          "color",
          "colors",
          "design",
          "designs",
        ],
      },
      {
        name: "folder-webpack",
        folderNames: ["webpack", ".webpack"],
      },
      {
        name: "folder-global",
        folderNames: ["global"],
      },
      {
        name: "folder-public",
        folderNames: ["public", "www", "wwwroot", "web", "website"],
      },
      {
        name: "folder-include",
        folderNames: ["include", "includes", "_includes", "inc"],
      },
      {
        name: "folder-docker",
        folderNames: ["docker", "dockerfiles", ".docker"],
      },
      {
        name: "folder-ngrx-effects",
        folderNames: ["effects"],
        enabledFor: [false],
      },
      {
        name: "folder-ngrx-store",
        folderNames: ["store"],
        enabledFor: [false],
      },
      {
        name: "folder-ngrx-state",
        folderNames: ["states", "state"],
        enabledFor: [false],
      },
      {
        name: "folder-ngrx-reducer",
        folderNames: ["reducers", "reducer"],
        enabledFor: [false],
      },
      {
        name: "folder-ngrx-actions",
        folderNames: ["actions"],
        enabledFor: [false],
      },
      {
        name: "folder-ngrx-entities",
        folderNames: ["entities"],
        enabledFor: [false],
      },
      {
        name: "folder-ngrx-selectors",
        folderNames: ["selectors"],
        enabledFor: [false],
      },
      {
        name: "folder-redux-reducer",
        folderNames: ["reducers", "reducer"],
        enabledFor: [false],
      },
      {
        name: "folder-redux-actions",
        folderNames: ["actions"],
        enabledFor: [false],
      },
      {
        name: "folder-redux-selector",
        folderNames: ["selectors", "selector"],
        enabledFor: [false],
      },
      {
        name: "folder-redux-store",
        folderNames: ["store"],
        enabledFor: [false],
      },
      {
        name: "folder-react-components",
        folderNames: ["components"],
        enabledFor: [false, false],
      },
      {
        name: "folder-database",
        folderNames: ["db", "database", "databases", "sql", "data", "_data"],
      },
      {
        name: "folder-log",
        folderNames: ["log", "logs"],
      },
      {
        name: "folder-target",
        folderNames: ["target"],
      },
      {
        name: "folder-temp",
        folderNames: [
          "temp",
          ".temp",
          "tmp",
          ".tmp",
          "cached",
          "cache",
          ".cache",
        ],
      },
      {
        name: "folder-aws",
        folderNames: ["aws", ".aws"],
      },
      {
        name: "folder-audio",
        folderNames: ["audio", "audios", "music", "musics", "sound", "sounds"],
      },
      {
        name: "folder-video",
        folderNames: ["video", "videos", "movie", "movies"],
      },
      {
        name: "folder-kubernetes",
        folderNames: ["kubernetes", "k8s"],
      },
      {
        name: "folder-import",
        folderNames: ["import", "imports", "imported"],
      },
      {
        name: "folder-export",
        folderNames: ["export", "exports", "exported"],
      },
      {
        name: "folder-wakatime",
        folderNames: ["wakatime"],
      },
      {
        name: "folder-circleci",
        folderNames: [".circleci"],
      },
      {
        name: "folder-wordpress",
        folderNames: [".wordpress-org", "wp-content"],
      },
      {
        name: "folder-gradle",
        folderNames: ["gradle", ".gradle"],
      },
      {
        name: "folder-coverage",
        folderNames: [
          "coverage",
          ".nyc-output",
          ".nyc_output",
          "e2e",
          "it",
          "integration-test",
          "integration-tests",
        ],
      },
      {
        name: "folder-class",
        folderNames: [
          "class",
          "classes",
          "model",
          "models",
          "schemas",
          "schema",
        ],
      },
      {
        name: "folder-other",
        folderNames: [
          "other",
          "others",
          "misc",
          "miscellaneous",
          "extra",
          "extras",
        ],
      },
      {
        name: "folder-typescript",
        folderNames: ["typescript", "ts", "typings", "@types", "types"],
      },
      {
        name: "folder-graphql",
        folderNames: ["graphql", "gql"],
      },
      {
        name: "folder-routes",
        folderNames: ["routes", "router", "routers"],
      },
      {
        name: "folder-ci",
        folderNames: [".ci", "ci"],
      },
      {
        name: "folder-benchmark",
        folderNames: [
          "benchmark",
          "benchmarks",
          "performance",
          "measure",
          "measures",
          "measurement",
        ],
      },
      {
        name: "folder-messages",
        folderNames: [
          "messages",
          "messaging",
          "forum",
          "chat",
          "chats",
          "conversation",
          "conversations",
        ],
      },
      {
        name: "folder-less",
        folderNames: ["less"],
      },
      {
        name: "folder-gulp",
        folderNames: ["gulp"],
      },
      {
        name: "folder-python",
        folderNames: ["python", "__pycache__", ".pytest_cache"],
      },
      {
        name: "folder-debug",
        folderNames: ["debug", "debugging"],
      },
      {
        name: "folder-fastlane",
        folderNames: ["fastlane"],
      },
      {
        name: "folder-plugin",
        folderNames: [
          "plugin",
          "plugins",
          "_plugins",
          "extension",
          "extensions",
          "addon",
          "addons",
          "module",
          "modules",
        ],
      },
      {
        name: "folder-middleware",
        folderNames: ["middleware", "middlewares"],
      },
      {
        name: "folder-controller",
        folderNames: [
          "controller",
          "controllers",
          "service",
          "services",
          "provider",
          "providers",
          "handler",
          "handlers",
        ],
      },
      {
        name: "folder-ansible",
        folderNames: ["ansible"],
      },
      {
        name: "folder-server",
        folderNames: ["server", "servers", "backend"],
      },
      {
        name: "folder-client",
        folderNames: ["client", "clients", "frontend", "pwa"],
      },
      {
        name: "folder-tasks",
        folderNames: ["tasks", "tickets"],
      },
      {
        name: "folder-android",
        folderNames: ["android"],
      },
      {
        name: "folder-ios",
        folderNames: ["ios"],
      },
      {
        name: "folder-upload",
        folderNames: ["uploads", "upload"],
      },
      {
        name: "folder-download",
        folderNames: ["downloads", "download"],
      },
      {
        name: "folder-tools",
        folderNames: ["tools"],
      },
      {
        name: "folder-helper",
        folderNames: ["helpers", "helper"],
      },
      {
        name: "folder-serverless",
        folderNames: [".serverless", "serverless"],
      },
      {
        name: "folder-api",
        folderNames: ["api", "apis", "restapi"],
      },
      {
        name: "folder-app",
        folderNames: ["app", "apps"],
      },
      {
        name: "folder-apollo",
        folderNames: [
          "apollo",
          "apollo-client",
          "apollo-cache",
          "apollo-config",
        ],
      },
      {
        name: "folder-archive",
        folderNames: [
          "archive",
          "archives",
          "archival",
          "backup",
          "backups",
          "back-up",
          "back-ups",
        ],
      },
      {
        name: "folder-batch",
        folderNames: ["batch", "batchs", "batches"],
      },
      {
        name: "folder-cluster",
        folderNames: ["cluster", "clusters"],
      },
      {
        name: "folder-command",
        folderNames: ["command", "commands", "cmd", "cli", "clis"],
      },
      {
        name: "folder-constant",
        folderNames: ["constant", "constants"],
      },
      {
        name: "folder-container",
        folderNames: ["container", "containers", ".devcontainer"],
      },
      {
        name: "folder-content",
        folderNames: ["content", "contents"],
      },
      {
        name: "folder-context",
        folderNames: ["context", "contexts"],
      },
      {
        name: "folder-core",
        folderNames: ["core"],
      },
      {
        name: "folder-delta",
        folderNames: ["delta", "deltas", "changes"],
      },
      {
        name: "folder-dump",
        folderNames: ["dump", "dumps"],
      },
      {
        name: "folder-examples",
        folderNames: [
          "demo",
          "demos",
          "example",
          "examples",
          "sample",
          "samples",
          "sample-data",
        ],
      },
      {
        name: "folder-environment",
        folderNames: [
          ".env",
          ".environment",
          "env",
          "envs",
          "environment",
          "environments",
          ".venv",
        ],
      },
      {
        name: "folder-functions",
        folderNames: [
          "function",
          "functions",
          "lambda",
          "lambdas",
          "logic",
          "math",
          "calc",
          "calculation",
          "calculations",
        ],
      },
      {
        name: "folder-generator",
        folderNames: [
          "generator",
          "generators",
          "generated",
          "cfn-gen",
          "gen",
          "gens",
          "auto",
        ],
      },
      {
        name: "folder-hook",
        folderNames: ["hook", "hooks", "trigger", "triggers"],
      },
      {
        name: "folder-job",
        folderNames: ["job", "jobs"],
      },
      {
        name: "folder-keys",
        folderNames: ["keys", "key", "token", "tokens"],
      },
      {
        name: "folder-layout",
        folderNames: ["layout", "layouts"],
      },
      {
        name: "folder-mail",
        folderNames: ["mail", "mails", "email", "emails", "smtp", "mailers"],
      },
      {
        name: "folder-mappings",
        folderNames: ["mappings", "mapping"],
      },
      {
        name: "folder-meta",
        folderNames: ["meta"],
      },
      {
        name: "folder-packages",
        folderNames: ["package", "packages", "pkg"],
      },
      {
        name: "folder-shared",
        folderNames: ["shared", "common"],
      },
      {
        name: "folder-stack",
        folderNames: ["stack", "stacks"],
      },
      {
        name: "folder-template",
        folderNames: ["template", "templates"],
      },
      {
        name: "folder-utils",
        folderNames: ["util", "utils", "utility", "utilities"],
      },
      {
        name: "folder-private",
        folderNames: ["private", ".private"],
      },
      {
        name: "folder-error",
        folderNames: ["error", "errors", "err"],
      },
      {
        name: "folder-event",
        folderNames: ["event", "events"],
      },
      {
        name: "folder-secure",
        folderNames: [
          "auth",
          "authentication",
          "secure",
          "security",
          "cert",
          "certs",
          "certificate",
          "certificates",
          "ssl",
        ],
      },
      {
        name: "folder-custom",
        folderNames: ["custom", "customs"],
      },
      {
        name: "folder-mock",
        folderNames: [
          "mock",
          "mocks",
          "draft",
          "drafts",
          "concept",
          "concepts",
          "sketch",
          "sketches",
        ],
      },
      {
        name: "folder-syntax",
        folderNames: ["syntax", "syntaxes", "spellcheck"],
      },
      {
        name: "folder-vm",
        folderNames: ["vm", "vms"],
      },
      {
        name: "folder-stylus",
        folderNames: ["stylus"],
      },
      {
        name: "folder-flow",
        folderNames: ["flow-typed"],
      },
      {
        name: "folder-rules",
        folderNames: [
          "rule",
          "rules",
          "validation",
          "validations",
          "validator",
          "validators",
        ],
      },
      {
        name: "folder-review",
        folderNames: ["review", "reviews", "revisal", "revisals", "reviewed"],
      },
      {
        name: "folder-animation",
        folderNames: ["animation", "animations", "animated"],
      },
      {
        name: "folder-guard",
        folderNames: ["guard", "guards"],
      },
      {
        name: "folder-prisma",
        folderNames: ["prisma"],
      },
      {
        name: "folder-pipe",
        folderNames: ["pipe", "pipes"],
      },
      {
        name: "folder-svg",
        folderNames: ["svg", "svgs"],
      },
      {
        name: "folder-vuex-store",
        folderNames: ["store"],
        enabledFor: [false],
      },
      {
        name: "folder-nuxt",
        folderNames: ["nuxt", ".nuxt"],
        enabledFor: [false, false],
      },
      {
        name: "folder-vue-directives",
        folderNames: ["directives"],
        enabledFor: [false, false],
      },
      {
        name: "folder-vue",
        folderNames: ["components"],
        enabledFor: [false, false],
      },
      {
        name: "folder-terraform",
        folderNames: ["terraform", ".terraform"],
      },
      {
        name: "folder-mobile",
        folderNames: ["mobile", "mobiles", "portable", "portability"],
      },
      {
        name: "folder-stencil",
        folderNames: [".stencil"],
      },
      {
        name: "folder-firebase",
        folderNames: [".firebase"],
      },
      {
        name: "folder-svelte",
        folderNames: ["svelte"],
      },
      {
        name: "folder-update",
        folderNames: ["update", "updates", "upgrade", "upgrades"],
      },
      {
        name: "folder-intellij",
        folderNames: [".idea"],
        light: true,
      },
      {
        name: "folder-azure-pipelines",
        folderNames: [".azure-pipelines", ".azure-pipelines-ci"],
      },
      {
        name: "folder-mjml",
        folderNames: ["mjml"],
      },
      {
        name: "folder-admin",
        folderNames: ["admin"],
      },
      {
        name: "folder-scala",
        folderNames: ["scala"],
      },
      {
        name: "folder-connection",
        folderNames: ["connection", "connections"],
      },
      {
        name: "folder-quasar",
        folderNames: [".quasar"],
      },
      {
        name: "folder-cobol",
        folderNames: ["cobol"],
      },
      {
        name: "folder-yarn",
        folderNames: ["yarn", ".yarn"],
      },
      {
        name: "folder-husky",
        folderNames: ["husky", ".husky"],
      },
      {
        name: "folder-storybook",
        folderNames: [".storybook", "storybook", "stories", "__stories__"],
      },
      {
        name: "folder-base",
        folderNames: ["base", ".base"],
      },
      {
        name: "folder-cart",
        folderNames: ["cart", "shopping-cart", "shopping", "shop"],
      },
      {
        name: "folder-home",
        folderNames: ["home", ".home", "start", ".start"],
      },
      {
        name: "folder-project",
        folderNames: ["project", "projects", ".project", ".projects"],
      },
      {
        name: "folder-interface",
        folderNames: ["interface", "interfaces"],
      },
      {
        name: "folder-contract",
        folderNames: [
          "pact",
          "pacts",
          "contract",
          ".contract",
          "contracts",
          "contract-testing",
          "contract-test",
          "contract-tests",
        ],
      },
      {
        name: "folder-queue",
        folderNames: ["queue", "queues", "bull", "mq"],
      },
      {
        name: "folder-vercel",
        folderNames: ["vercel", ".vercel", "now", ".now"],
      },
      {
        name: "folder-cypress",
        folderNames: ["cypress", ".cypress"],
      },
      {
        name: "folder-java",
        folderNames: ["java"],
      },
      {
        name: "folder-resolver",
        folderNames: ["resolver", "resolvers"],
      },
      {
        name: "folder-angular",
        folderNames: [".angular"],
      },
    ],
  },
  moreExtensions: {
    fileExtensions: {
      prettierignore: "prettier",
      prettierrc: "prettier",
      PL: "perl",
      Xsession: "console",
      asp: "html",
      aspx: "html",
      bash: "console",
      bash_aliases: "console",
      bash_login: "console",
      bash_logout: "console",
      bash_profile: "console",
      bashrc: "console",
      bat: "console",
      cake: "csharp",
      cjs: "javascript",
      clj: "clojure",
      cljc: "clojure",
      cljs: "clojure",
      cljx: "clojure",
      clojure: "clojure",
      cmd: "console",
      "code-search": "search",
      containerfile: "docker",
      cpy: "python",
      cs: "csharp",
      csh: "console",
      cshrc: "console",
      cshtml: "razor",
      csv: "table",
      csx: "csharp",
      ctp: "php",
      cts: "typescript",
      dockerfile: "docker",
      dsql: "database",
      ebuild: "console",
      edn: "clojure",
      ejs: "html",
      erb: "ruby",
      es6: "javascript",
      fs: "fsharp",
      fsi: "fsharp",
      fsscript: "fsharp",
      fsx: "fsharp",
      gemspec: "ruby",
      gyp: "python",
      gypi: "python",
      handlebars: "handlebars",
      hbs: "handlebars",
      hjs: "handlebars",
      htm: "html",
      html: "html",
      ipy: "python",
      ipynb: "jupyter",
      jl: "julia",
      js: "javascript",
      jshtm: "html",
      jsp: "html",
      jsx: "react",
      ksh: "console",
      mdoc: "html",
      mjs: "javascript",
      mts: "typescript",
      nqp: "perl",
      p6: "perl",
      pac: "javascript",
      php: "php",
      php4: "php",
      php5: "php",
      phtml: "php",
      pl: "perl",
      pl6: "perl",
      pm: "perl",
      pm6: "perl",
      pod: "perl",
      podspec: "ruby",
      profile: "console",
      ps1: "powershell",
      psd1: "powershell",
      psgi: "perl",
      psm1: "powershell",
      psrc: "powershell",
      pssc: "powershell",
      py: "python",
      pyi: "python",
      pyt: "python",
      pyw: "python",
      rake: "ruby",
      rb: "ruby",
      rbi: "ruby",
      rbx: "ruby",
      rhtml: "html",
      rjs: "ruby",
      rpy: "python",
      rs: "rust",
      ru: "ruby",
      sh: "console",
      shader: "shaderlab",
      shtml: "html",
      sql: "database",
      t: "perl",
      tcshrc: "console",
      ts: "typescript",
      tsv: "table",
      tsx: "react_ts",
      volt: "html",
      xht: "html",
      xhtml: "html",
      xprofile: "console",
      xsession: "console",
      xsessionrc: "console",
      yash_profile: "console",
      yashrc: "console",
      zlogin: "console",
      zlogout: "console",
      zprofile: "console",
      zsh: "console",
      "zsh-theme": "console",
      zshenv: "console",
      zshrc: "console",
    },
    fileNames: {
      ".azure-pipelines.yaml": "azure-pipelines",
      ".azure-pipelines.yml": "azure-pipelines",
      ".babelrc.json": "json",
      ".devcontainer.json": "json",
      ".ember-cli": "json",
      ".envrc": "console",
      ".hushlogin": "console",
      ".vscodeignore": "git",
      ".vsts-ci.yml": "azure-pipelines",
      ".watchmanconfig": "json",
      APKBUILD: "console",
      Containerfile: "docker",
      Dockerfile: "docker",
      GNUmakefile: "settings",
      Jenkinsfile: "groovy",
      Makefile: "settings",
      OCamlMakefile: "settings",
      PKGBUILD: "console",
      SConscript: "python",
      SConstruct: "python",
      Snakefile: "python",
      appfile: "ruby",
      appraisals: "ruby",
      "argv.json": "json",
      "azure-pipelines.yaml": "azure-pipelines",
      "azure-pipelines.yml": "azure-pipelines",
      "babel.config.json": "json",
      bashrc_Apple_Terminal: "console",
      berksfile: "ruby",
      "berksfile.lock": "ruby",
      brewfile: "ruby",
      capfile: "ruby",
      cheffile: "ruby",
      "color-theme.json": "json",
      "composer.lock": "json",
      dangerfile: "ruby",
      deliverfile: "ruby",
      "extensions.json": "json",
      fastfile: "ruby",
      gemfile: "ruby",
      guardfile: "ruby",
      gymfile: "ruby",
      hobofile: "ruby",
      "icon-theme.json": "json",
      jakefile: "javascript",
      "jsconfig.json": "json",
      "keybindings.json": "json",
      "language-configuration.json": "json",
      "launch.json": "json",
      makefile: "settings",
      matchfile: "ruby",
      podfile: "ruby",
      "profiles.json": "json",
      puppetfile: "ruby",
      rakefile: "ruby",
      rantfile: "ruby",
      scanfile: "ruby",
      "settings.json": "json",
      snapfile: "ruby",
      "tasks.json": "json",
      thorfile: "ruby",
      "tsconfig.json": "json",
      "tslint.json": "json",
      vagrantfile: "ruby",
      "vsts-ci.yml": "azure-pipelines",
      zlogin: "console",
      zlogout: "console",
      zprofile: "console",
      zshenv: "console",
      zshrc: "console",
      zshrc_Apple_Terminal: "console",
    },
  },
};
// END SCRIPT: LANGUAGE MAP
