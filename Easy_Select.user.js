// ==UserScript==
// @name         Selection userscript
// @namespace    mailto:explosionscratch@gmail.com
// @source       https://github.com/Explosion-Scratch/userscripts/blob/main/Easy_Select.user.js
// @version      0.2
// @description  Allows you to easily select text. Control + click for the whole element, Control + Shift + click for one word, Shift + Click for one sentence.
// @author       Explosion-Scratch
// @match        *://*/*
// @icon         https://api.iconify.design/bi:cursor-text.svg?color=white
// @grant        none
// ==/UserScript==

(async () => {
	const NOT_ALLOWED = `input, textarea, [contenteditable], #editor, #codeflask, .view-line, .monaco-editor, .codeflask, [class*=codeflask__]`;
	const TRACKING_PARAMS =
		`stm, ns, sc, utm, fb, ga, id, gs, hmb, wt, ref`.split(", ");
	let keys = {};
	window.onblur = (e) => (console.log("Window unfocused"), (keys = {}));
	let mouse = { x: 0, y: 0, target: document.body };
	window.onmousemove = (e) =>
		(mouse = { x: e.x, y: e.y, target: document.elementFromPoint(e.x, e.y) });
	window.onkeydown = (e) => {
		keys[e.key] = true;
		keys.Alt = e.altKey;
		keys.Control = e.ctrlKey;
		keys.Shift = e.shiftKey;
		if (mouse.target.closest("a") || e.target.closest("a")) {
			// We check this onclick instead
			//return console.log("Closest a");
		}
		if (
			!e.target.closest(NOT_ALLOWED) &&
			!document.activeElement.closest(NOT_ALLOWED)
		) {
			if (e.key.toLowerCase() === "r" && mouse.target.closest("a")) {
				navigator.clipboard.writeText(mouse.target.closest("a").href);
				toast("Copied URL");
				return;
			}
			if (e.key === "Enter" && mouse.target.closest("a")) {
				toast("Opening");
				window.open(
					strip(mouse.target.closest("a").href, TRACKING_PARAMS),
					"copytab"
				);
				e.preventDefault();
				//Remove tracking, you're welcome
				function strip(url, params) {
					let u = new URL(url);
					let spo = new URLSearchParams(u.search);
					let sp = spo.entries();
					for (let [k, v] of sp) {
						if (params.find((i) => k.includes(i))) {
							spo.delete(k);
						}
					}
					u.search = spo;
					return u.toString();
				}
			}
			if (
				!window.getSelection().toString()?.length &&
				["g", "t", "h"].includes(e.key)
			) {
				return;
			}
			if (e.key.toLowerCase() === "g") {
				toast("Opening google");
				window.open(
					`https://google.com/search?q=${encodeURIComponent(
						window.getSelection().toString().trim()
					)}`,
					"copytab"
				);
				return;
			}
            if (e.key.toLowerCase() === "h") {
				document.dispatchEvent(new CustomEvent("highlight"));
				return;
			}
			if (e.key.toLowerCase() === "t") {
				navigator.clipboard.writeText(
					window
						.getSelection()
						.toString()
						.replace(/^(["'\W]*)/g, "")
						.replace(/(["'\W]*)$/g, "")
				);
				toast("Copied trimmed");
				return;
			}
		}
		if (
			(e.key.toLowerCase() === "c" || e.key.toLowerCase() === "y") &&
			!e.target.closest(NOT_ALLOWED) &&
			!document.activeElement.closest(NOT_ALLOWED)
		) {
			if (mouse.target.closest("img")) {
				(async () => {
					let src = mouse.target.closest("img").src;
					let blob = await getBlob(src);
					navigator.clipboard
						.write([
							new ClipboardItem({
								[blob.type]: blob,
							}),
						])
						.then(
							(...a) => (console.log("Copied: ", ...a), toast("Copied image!")),
							(...a) => (console.log("Failed: ", ...a), copyJpg(blob))
						);

					async function copyJpg(blob) {
						//Probably jpg and can't copy
						blob = await toPNG(blob);
						navigator.clipboard
							.write([
								new ClipboardItem({
									[blob.type]: blob,
								}),
							])
							.then(
								(...a) => (
									console.log("Copied: ", ...a), toast("Copied image!")
								),
								(...a) => (
									console.log("Failed: ", ...a), toast("Couldn't copy image")
								)
							);
					}
					function toPNG(blob) {
						return new Promise(async (resolve) => {
							let canvas = document.createElement("canvas");
							let ctx = canvas.getContext("2d");
							let img = new Image();
							img.onload = () => {
								let width = img.naturalWidth;
								let height = img.naturalHeight;
								Object.assign(canvas, { width, height });

								ctx.drawImage(img, 0, 0, width, height);

								canvas.toBlob((blob) => resolve(blob), "image/png", 1);
							};
							img.src = URL.createObjectURL(blob);
						});
					}
				})();
				console.log("Is img", mouse.target.closest("img"));
				return;
			}
			console.log("Target: ", mouse.target);
			if (
				window.getSelection().toString()?.trim()?.length < 10 &&
				(mouse.target.querySelector("svg") || mouse.target.closest("svg"))
			) {
				let el =
					mouse.target.querySelector("svg") || mouse.target.closest("svg");
				(async () => {
					let data = new XMLSerializer().serializeToString(el);
					let svgBlob = new Blob([data], {
						type: "image/svg+xml;charset=utf-8",
					});
					let src = URL.createObjectURL(svgBlob);
					let converter = new SvgToPngConverter();
					let image = await new Promise((r) =>
						converter.convertFromInput(src, r)
					);
					console.log(image);
					navigator.clipboard
						.write([
							new ClipboardItem({
								"image/png": toBlob(image),
							}),
						])
						.then(
							(...a) => (console.log("Copied: ", ...a), toast("Copied SVG")),
							(...a) => (console.log("Failed: ", ...a), toast("Couldn't copy"))
						);
				})();
			}
			async function getBlob(url, retried = false) {
				if (retried) {
					return fetch(url).then((r) => r.blob());
				}
				try {
					return await fetch(url).then((r) => r.blob());
				} catch (e) {
					return await fetch(
						`https://cors.explosionscratc.repl.co/${url.split("//")[1]}`
					).then((r) => r.blob());
				}
			}
			function toBlob(dataurl) {
				var arr = dataurl.split(","),
					mime = arr[0].match(/:(.*?);/)[1],
					bstr = atob(arr[1]),
					n = bstr.length,
					u8arr = new Uint8Array(n);
				while (n--) {
					u8arr[n] = bstr.charCodeAt(n);
				}
				return new Blob([u8arr], { type: mime });
			}
			async function img(dataurl, width, height) {
				return new Promise((resolve) => {
					let canvas = document.createElement("canvas");
					let ctx = canvas.getContext("2d");
					let img = new Image();
					img.src = dataurl;
					img.onload = async (e) => {
						console.log("Image loaded");
						canvas.width = width || e.target.naturalWidth;
						canvas.height = height || e.target.naturalHeight;
						ctx.drawImage(
							e.target,
							width || e.target.naturalWidth,
							height || e.target.naturalHeight
						);
						canvas.toBlob((b) => resolve(b), "image/png", 1);
					};
					console.log("Created image");
				});
			}
			function toData(blob) {
				return new Promise((callback) => {
					var a = new FileReader();
					a.onload = function (e) {
						callback(e.target.result);
					};
					a.readAsDataURL(blob);
				});
			}
			if (window.getSelection().toString()?.trim()?.length) {
				navigator.clipboard.writeText(window.getSelection().toString());
				toast("Copied selection");
			}
		}
		if (
			e.key.toLowerCase() === "s" &&
			!e.target.closest(NOT_ALLOWED) &&
			!document.activeElement.closest(NOT_ALLOWED)
		) {
			if (!(keys.Control || keys.Shift)) {
				let ok = { ...keys };
				keys = { Shift: true };
				sel(document.elementFromPoint(mouse.x, mouse.y), mouse);
				keys = { ...ok };
			} else {
				sel(document.elementFromPoint(mouse.x, mouse.y), mouse);
			}
		}
	};
	window.onkeyup = (e) => {
		keys.Alt = e.altKey;
		keys.Control = e.ctrlKey;
		keys.Shift = e.shiftKey;
		keys[e.key] = false;
	};

	window.onclick = (e) => {
		if (!(keys.Alt || keys.Control || keys.Shift)) {
			return;
		}
		if (mouse.target.closest("a") || e.target.closest("a")) {
			console.log("Closest a");
			return;
		}
		sel(e.target, { x: e.x, y: e.y, target: e.target });
	};

	function sel(target, mouse) {
		console.log({
			"Closest a target: ": target.closest("a"),
			"Closest a mouse": mouse.target.closest("a"),
			"Closest not allowed (target): ": target.closest(NOT_ALLOWED),
			"Closest activeElement: ": document.activeElement.closest(NOT_ALLOWED),
		});
		console.log("Past a");
		if (
			target.closest(NOT_ALLOWED) ||
			document.activeElement.closest(NOT_ALLOWED)
		) {
			console.log("Not allowed");
			return;
		}
		console.log("Paste notallowed");
		window.event.preventDefault();
		window.event.stopPropagation();
		console.log("Sel called", { target, mouse });
		console.log(keys);
		let node = target;
		const selection = window.getSelection();
		let range;
		if (keys.Control && keys.Shift) {
			range = word(mouse.x, mouse.y, "word");
		} else if (keys.Control && !keys.Shift) {
			range = document.createRange();
			range.selectNodeContents(node);
			toast("Selected element");
		} else if (keys.Shift) {
			range = word(mouse.x, mouse.y, "sentence");
		}
		if (range) {
			selection.removeAllRanges();
			selection.addRange(range);
		}
	}

	function word(x, y, mode) {
		document.dispatchEvent(
			new CustomEvent("selection-userscript-selected", {
				detail: { x, y, mode },
			})
		);
		var range = document.caretRangeFromPoint(x, y);
		toast(`Selected ${mode}`);
		if (range.startContainer.nodeType === Node.TEXT_NODE) {
			range.expand(mode);
			return range;
		}

		return null;
	}
	class SvgToPngConverter {
		constructor() {
			this._init = this._init.bind(this);
			this._cleanUp = this._cleanUp.bind(this);
			this.convertFromInput = this.convertFromInput.bind(this);
		}

		_init() {
			this.canvas = document.createElement("canvas");
			this.imgPreview = document.createElement("img");
			this.imgPreview.style = "position: absolute; top: -9999px";

			document.body.appendChild(this.imgPreview);
			this.canvasCtx = this.canvas.getContext("2d");
		}

		_cleanUp() {
			document.body.removeChild(this.imgPreview);
		}

		convertFromInput(input, callback) {
			this._init();
			let _this = this;
			this.imgPreview.onload = function () {
				const img = new Image();
				_this.canvas.width = 128;
				_this.canvas.height = 128;
				img.crossOrigin = "anonymous";
				img.src = _this.imgPreview.src;
				img.onload = function () {
					_this.canvasCtx.drawImage(img, 0, 0, 128, 128);
					let imgData = _this.canvas.toDataURL("image/png");
					if (typeof callback == "function") {
						callback(imgData);
					}
					_this._cleanUp();
				};
			};

			this.imgPreview.src = input;
		}
	}
	function toast(text, timeout = 1500) {
		let t = document.createElement("div");
		document.querySelector("#copy_toast")?.remove();
		t.id = "copy_toast";
		t.setAttribute(
			"style",
			`
            position: fixed;
            bottom: -200px;
            z-index: 1000000000;
            transition: bottom .5s cubic-bezier(.44,.57,.44,1.25);
            border-radius: 1000px;
            background: #000a;
            border: 1px solid #0009;
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 4px 15px;
            left: 50vw;
            transform: translate(-50%, -50%);
            font-family: monospace;
            width: fit-content;
            `
		);
		document.body.insertAdjacentElement("afterend", t);
		t.innerText = text;
		setTimeout(() => {
			t.style.bottom = "3px";
		}, 10);
		setTimeout(() => (t.style.bottom = "-200px"), timeout - 500);
		setTimeout(() => t.remove(), timeout);
	}
	const buff_to_base64 = (buff) => btoa(String.fromCharCode.apply(null, buff));

	const base64_to_buf = (b64) =>
		Uint8Array.from(atob(b64), (c) => c.charCodeAt(null));

	const enc = new TextEncoder();
	const dec = new TextDecoder();

	const getPasswordKey = (password) =>
		window.crypto.subtle.importKey(
			"raw",
			enc.encode(password),
			"PBKDF2",
			false,
			["deriveKey"]
		);

	const deriveKey = (passwordKey, salt, keyUsage) =>
		window.crypto.subtle.deriveKey(
			{
				name: "PBKDF2",
				salt: salt,
				iterations: 250000,
				hash: "SHA-256",
			},
			passwordKey,
			{
				name: "AES-GCM",
				length: 256,
			},
			false,
			keyUsage
		);

	(async () => {
		let store = {
			range: null,
			selections: [],
		};
		let url = location.hostname + location.pathname + location.search;
		let hashedurl = await hash(url, 500);
		async function getSelections() {
			try {
				return await fetch(
					`https://selections.explosionscratc.repl.co/${hashedurl}`
				)
					.then((r) => r.json())
					.then((j) => decrypt(j, url))
					.then(JSON.parse);
			} catch (e) {
				return [];
			}
		}
		async function addSelection() {
			fetch(`https://selections.explosionscratc.repl.co/${hashedurl}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					body: await encrypt(JSON.stringify([...store.selections]), url),
				}),
			});
		}
		let selections = await getSelections();

		store.selections = selections;

		for (let selection of selections) {
			highlight(restore(selection));
		}

		document.addEventListener("selection-userscript-selected", () => {
			console.log("selected");
			tooltip();
		});

		document.addEventListener(
			"selection-userscript-highlighted",
			({ detail }) => {
				store = {
					...store,
					...detail,
				};
			}
		);
        document.addEventListener("highlight", async () => {
            store.selections.push(save(window.getSelection()));
            addSelection(store.selections.slice(-1)[0]);
            store.range = window.getSelection().getRangeAt(0);
            highlight(store.range);
        })
		document.addEventListener("mouseup", tooltip);
		document.addEventListener("selectionchange", () => {
			if (window.getSelection().toString().length === 0) {
				removeTooltip();
			} else {
				tooltip();
			}
		});

		function tooltip() {
			removeTooltip();
			if (window.getSelection().toString().length === 0) {
				return;
			}
			let s = window.getSelection();
			if (s.baseNode.parentElement !== s.extentNode.parentElement) {
				return;
			}
			let range = getRangeObject(s);
			let rect = range.getBoundingClientRect();
			console.log(rect);
			let div = document.createElement("div");
			div.id = "selectButton";
			let offsetX = 3,
				offsetY = 3;
			offsetY += window.scrollY;
			Object.assign(div.style, {
				top: rect.top + rect.height + offsetY + "px",
				left: rect.left + rect.width + offsetX + "px",
				background: "#eee",
				color: "#333",
				position: "absolute",
				cursor: "pointer",
				padding: "3px",
				display: "grid",
				placeItems: "center",
				borderRadius: "400px",
				display: "none",
			});
			div.innerHTML = `<svg style="width: 20px; height: 20px;" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--lucide" width="32" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="m9 11l-6 6v3h9l3-3"></path><path d="m22 12l-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"></path></g></svg>`;
			document.body.appendChild(div);
			div.onmousedown = () => {
				console.log("Button clicked");
                store.range = window.getSelection();
				store.selections.push(save(window.getSelection()));
				addSelection(store.selections.slice(-1)[0]);
				highlight(store.range);
			};
			document.dispatchEvent(
				new CustomEvent("selection-userscript-highlighted", {
					detail: {
						element: s.baseNode.parentElement,
						selection: s,
						range,
						rect,
					},
				})
			);
		}

		function removeTooltip() {
			document.querySelector("#selectButton")?.remove();
		}
		function findParent(elem1, elem2) {
			for (; elem1 != null; elem1 = elem1.parentNode) {
				for (var e2 = elem2; e2 != null; e2 = e2.parentNode)
					if (elem1 == e2) return elem1;
			}
			return null;
		}
		function getRangeObject(selectionObject) {
			try {
				if (selectionObject.getRangeAt) return selectionObject.getRangeAt(0);
			} catch (ex) {
				console.log(ex);
			}
		}
		function highlight(range) {
            if (range instanceof Selection){range = range.getRangeAt(0);}
			console.log("highlight called", range);
			if (!range) {
				return;
			}
			let span = document.createElement("span");
			span.setAttribute(
				"style",
				"background: #0bb3; border-bottom: 2px solid #0bb;"
			);
			span.classList.add("highlight");
			let contents = range.extractContents();
			span.appendChild(contents);
			range.insertNode(span);
		}
		function xpath(elm) {
			var allNodes = document.getElementsByTagName("*");
			for (var segs = []; elm && elm.nodeType == 1; elm = elm.parentNode) {
				if (elm.hasAttribute("id")) {
					var uniqueIdCount = 0;
					for (var n = 0; n < allNodes.length; n++) {
						if (allNodes[n].hasAttribute("id") && allNodes[n].id == elm.id)
							uniqueIdCount++;
						if (uniqueIdCount > 1) break;
					}
					if (uniqueIdCount == 1) {
						segs.unshift('id("' + elm.getAttribute("id") + '")');
						return segs.join("/");
					} else {
						segs.unshift(
							elm.localName.toLowerCase() +
								'[@id="' +
								elm.getAttribute("id") +
								'"]'
						);
					}
				} else if (elm.hasAttribute("class")) {
					segs.unshift(
						elm.localName.toLowerCase() +
							'[@class="' +
							elm.getAttribute("class") +
							'"]'
					);
				} else {
					for (
						i = 1, sib = elm.previousSibling;
						sib;
						sib = sib.previousSibling
					) {
						if (sib.localName == elm.localName) i++;
					}
					segs.unshift(elm.localName.toLowerCase() + "[" + i + "]");
				}
			}
			return segs.length ? "/" + segs.join("/") : null;
		}
		function getpath(path) {
			var evaluator = new XPathEvaluator();
			var result = evaluator.evaluate(
				path,
				document.documentElement,
				null,
				XPathResult.FIRST_ORDERED_NODE_TYPE,
				null
			);
			return result.singleNodeValue;
		}

		function restore(state) {
			let referenceNode = getpath(state.element);
			referenceNode = referenceNode || document.body;

			var i,
				node,
				nextNodeCharIndex,
				currentNodeCharIndex = 0,
				nodes = [referenceNode],
				sel = window.getSelection(),
				range = document.createRange();

			range.setStart(referenceNode, 0);
			range.collapse(true);

			while ((node = nodes.pop())) {
				if (node.nodeType === 3) {
					// TEXT_NODE
					nextNodeCharIndex = currentNodeCharIndex + node.length;

					// if this node contains the character at the start index, set this as the
					// starting node with the correct offset
					if (
						state.start >= currentNodeCharIndex &&
						state.start <= nextNodeCharIndex
					) {
						range.setStart(node, state.start - currentNodeCharIndex);
					}

					// if this node contains the character at the end index, set this as the
					// ending node with the correct offset and stop looking
					if (
						state.end >= currentNodeCharIndex &&
						state.end <= nextNodeCharIndex
					) {
						range.setEnd(node, state.end - currentNodeCharIndex);
						break;
					}

					currentNodeCharIndex = nextNodeCharIndex;
				} else {
					// get child nodes if the current node is not a text node
					i = node.childNodes.length;
					while (i--) {
						nodes.push(node.childNodes[i]);
					}
				}
			}
			return range;
		}

		// serialize the current selection offsets using given node as a reference point
		function save(selection) {
			let referenceNode = selection.baseNode.parentElement || document.body;

			var sel = selection,
				range = sel.rangeCount
					? sel.getRangeAt(0).cloneRange()
					: document.createRange(),
				startContainer = range.startContainer,
				startOffset = range.startOffset,
				state = {
					content: range.toString(),
				};

			// move the range to select the contents up to the selection
			// so we can find its character offset from the reference node
			range.selectNodeContents(referenceNode);
			range.setEnd(startContainer, startOffset);

			state.start = range.toString().length;
			state.end = state.start + state.content.length;

			// add a shortcut method to restore this selection
			state.restore = restore.bind(null, state, referenceNode);

			return {
				...state,
				element: xpath(sel.baseNode.parentElement),
			};
		}

		async function encrypt(secretData, password) {
			try {
				const salt = window.crypto.getRandomValues(new Uint8Array(16));
				const iv = window.crypto.getRandomValues(new Uint8Array(12));
				const passwordKey = await getPasswordKey(password);
				const aesKey = await deriveKey(passwordKey, salt, ["encrypt"]);
				const encryptedContent = await window.crypto.subtle.encrypt(
					{
						name: "AES-GCM",
						iv: iv,
					},
					aesKey,
					enc.encode(secretData)
				);

				const encryptedContentArr = new Uint8Array(encryptedContent);
				let buff = new Uint8Array(
					salt.byteLength + iv.byteLength + encryptedContentArr.byteLength
				);
				buff.set(salt, 0);
				buff.set(iv, salt.byteLength);
				buff.set(encryptedContentArr, salt.byteLength + iv.byteLength);
				const base64Buff = buff_to_base64(buff);
				return base64Buff;
			} catch (e) {
				console.log(`Error - ${e}`);
				return "";
			}
		}

		async function decrypt(encryptedData, password) {
			const encryptedDataBuff = base64_to_buf(encryptedData);
			const salt = encryptedDataBuff.slice(0, 16);
			const iv = encryptedDataBuff.slice(16, 16 + 12);
			const data = encryptedDataBuff.slice(16 + 12);
			const passwordKey = await getPasswordKey(password);
			const aesKey = await deriveKey(passwordKey, salt, ["decrypt"]);
			const decryptedContent = await window.crypto.subtle.decrypt(
				{
					name: "AES-GCM",
					iv: iv,
				},
				aesKey,
				data
			);
			return dec.decode(decryptedContent);
		}

		async function hash(str, iterations = 1000) {
			const buf = await crypto.subtle.digest(
				"SHA-256",
				new TextEncoder("utf-8").encode(str)
			);
			let result = Array.prototype.map
				.call(new Uint8Array(buf), (x) => ("00" + x.toString(16)).slice(-2))
				.join("");
			if (iterations === 0) {
				return result;
			} else {
				return await hash(result, iterations - 1);
			}
		}
	})();
})();
