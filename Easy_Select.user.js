// ==UserScript==
// @name         Selection userscript
// @namespace    mailto:explosionscratch@gmail.com
// @source       https://github.com/Explosion-Scratch/userscripts/blob/main/Easy_Select.user.js
// @downloadURL  https://github.com/Explosion-Scratch/userscripts/raw/main/Easy_Select.user.js
// @updateURL    https://github.com/Explosion-Scratch/userscripts/raw/main/Easy_Select.user.js
// @version      0.1
// @description  Allows you to easily select text. Control + click for the whole element, Control + Shift + click for one word, Shift + Click for one sentence.
// @author       Explosion-Scratch
// @match        *://*/*
// @icon         https://api.iconify.design/bi:cursor-text.svg?color=white
// @grant        none
// ==/UserScript==

(async () => {
	"use strict";
	const NOT_ALLOWED = `input, textarea, [contenteditable], #editor, #codeflask, .view-line, .monaco-editor, .codeflask, [class*=codeflask__]`;
    const TRACKING_PARAMS = `stm, ns, sc, utm, fb, ga, id, gs, hmb, wt, ref`.split(", ");
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
            if (e.key.toLowerCase() === "h" && mouse.target.closest("a")){
                navigator.clipboard.writeText(mouse.target.closest("a").href);
                toast("Copied URL");
                return;
            }
            if (e.key === "Enter" && mouse.target.closest("a")){
                toast("Opening");
                window.open(strip(mouse.target.closest("a").href, TRACKING_PARAMS), "copytab");
                e.preventDefault();
                //Remove tracking, you're welcome
                function strip(url, params){
                    let u = new URL(url);
                    let spo = new URLSearchParams(u.search);
                    let sp = spo.entries()
                    for (let [k, v] of sp){
                        if (params.find(i => k.includes(i))){
                            spo.delete(k);
                        }
                    }
                    u.search = spo;
                    return u.toString();
                }
            }
            if (!window.getSelection().toString()?.length && ["g", "t"].includes(e.key)){return}
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
            async function getBlob(url, retried = false){
               if (retried){return fetch(url).then(r => r.blob())}
               try {
                  return await fetch(url).then(r => r.blob());
               } catch(e){
                   return await fetch(`https://cors.explosionscratc.repl.co/${url.split("//")[1]}`).then(r => r.blob());
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
})();
