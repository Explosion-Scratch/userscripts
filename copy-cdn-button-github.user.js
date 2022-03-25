// ==UserScript==
// @name         Copy CDN URL GitHub
// @namespace    mailto:explosionscratch@gmail.com
// @source       https://github.com/Explosion-Scratch/userscripts/blob/main/copy-cdn-button-github.user.js
// @updateURL    https://github.com/Explosion-Scratch/userscripts/blob/main/copy-cdn-button-github.user.js
// @downloadURL  https://github.com/Explosion-Scratch/userscripts/blob/main/copy-cdn-button-github.user.js
// @version      0.1
// @description  Adds a button to copy the Githack URL to a file in GitHub (next to the edit, delete, copy, buttons)
// @author       Explosion-Scratch
// @match        https://github.com/*/*
// @icon         https://icons.duckduckgo.com/ip2/github.com.ico
// @grant        none
// ==/UserScript==

const DEV_OR_PROD = "prod";
//If it's currently adding the button;
let RUNNING = false;
const tryToAddButton = () => {
    document.querySelector("#CDN_LINK_COPY")?.remove();
    if (/^https?\:\/\/*\.?github.com\/\S+\/\S+\/blob\/(?:\S+\/)+\S+$/gi.test(location.href)){
        main();
    } else {console.log("Location doesn't match")}
};
tryToAddButton();
(async () => {
    history.pushState = ( f => function pushState(){
        var ret = f.apply(this, arguments);
        window.dispatchEvent(new Event('pushstate'));
        window.dispatchEvent(new Event('locationchange'));
        return ret;
    })(history.pushState);

    history.replaceState = ( f => function replaceState(){
        var ret = f.apply(this, arguments);
        window.dispatchEvent(new Event('replacestate'));
        window.dispatchEvent(new Event('locationchange'));
        return ret;
    })(history.replaceState);

    window.addEventListener('popstate',()=>{
        window.dispatchEvent(new Event('locationchange'))
    });

    window.addEventListener("locationchange", tryToAddButton)
})();

async function main(){
    if (RUNNING){return};
    RUNNING = true;
	await element(".Box-header.js-blob-header");
	let el = [
		...document.querySelectorAll(".Box-header.js-blob-header > div > div"),
	].slice(-1)[0];
	let cpy = el.querySelector(
		"remote-clipboard-copy > span:nth-child(1) > span"
	);
	let svg = `<svg
	style="box-sizing: content-box; fill: currentColor;"
	width="16"
	height="16"
	viewBox="0 0 16 16"
	fill="none"
	data-view-component="true"
	xmlns="http://www.w3.org/2000/svg"
	viewBox="0 0 16 16"
	width="16"
	height="16">
	<path
		fill-rule="evenodd"
		d="M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z"></path>
</svg>
`;
	let label = "Copy CDN URL";
	let copyThis = (await convert(location.href))[DEV_OR_PROD];
	let copiedLabel = "Done!";
	let html = `<remote-clipboard-copy
    id="CDN_LINK_COPY"
	class="d-inline-block btn-octicon"
	style="height: 26px"
	data-src=${JSON.stringify(`data:text/plain;base64,${btoa(copyThis)}`)}
	data-action="click:remote-clipboard-copy#remoteCopy"
	data-catalyst=""
	data-state-timeout="2000">
	<span data-target="remote-clipboard-copy.idle">
		<span
			class="tooltipped tooltipped-nw cursor-pointer"
			data-hydro-click=${JSON.stringify(el.getAttribute("data-hydro-click"))}
			data-hydro-click-hmac=${JSON.stringify(
				el.getAttribute("data-hydro-click-hmac")
			)}
			aria-label="${label}">
			${svg}</span
	></span>
	<span data-target="remote-clipboard-copy.fetching" hidden="">
		<svg
			style="box-sizing: content-box; color: var(--color-icon-primary)"
			width="16"
			height="16"
			viewBox="0 0 16 16"
			fill="none"
			data-view-component="true"
			class="anim-rotate">
			<circle
				cx="8"
				cy="8"
				r="7"
				stroke="currentColor"
				stroke-opacity="0.25"
				stroke-width="2"
				vector-effect="non-scaling-stroke"></circle>
			<path
				d="M15 8a7.002 7.002 0 00-7-7"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				vector-effect="non-scaling-stroke"></path>
		</svg>
	</span>
	<span data-target="remote-clipboard-copy.success" hidden="">
		<span class="tooltipped tooltipped-nw" aria-label="${copiedLabel}">
			${svg}
		</span>
	</span>
	<span data-target="remote-clipboard-copy.error" hidden="">
		<span
			class="tooltipped tooltipped-nw"
			aria-label="Something went wrong. Try again.">
			<svg
				aria-hidden="true"
				height="16"
				viewBox="0 0 16 16"
				version="1.1"
				width="16"
				data-view-component="true"
				class="octicon octicon-alert color-fg-attention">
				<path
					fill-rule="evenodd"
					d="M8.22 1.754a.25.25 0 00-.44 0L1.698 13.132a.25.25 0 00.22.368h12.164a.25.25 0 00.22-.368L8.22 1.754zm-1.763-.707c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0114.082 15H1.918a1.75 1.75 0 01-1.543-2.575L6.457 1.047zM9 11a1 1 0 11-2 0 1 1 0 012 0zm-.25-5.25a.75.75 0 00-1.5 0v2.5a.75.75 0 001.5 0v-2.5z"></path>
			</svg>
		</span>
	</span>
</remote-clipboard-copy>
`;
	el.innerHTML = `${html} ${el.innerHTML}`;
    RUNNING = false;
	function element(selector) {
		return new Promise((resolve) => {
			if (document.querySelector(selector)) {
				return resolve(document.querySelector(selector));
			}

			const observer = new MutationObserver((mutations) => {
				if (document.querySelector(selector)) {
					resolve(document.querySelector(selector));
					observer.disconnect();
				}
			});

			observer.observe(document.body, {
				childList: true,
				subtree: true,
			});
		});
	}
}
function convert(url) {
	return new Promise((resolve) => {
		const GITHUB_API_URL = "https://api.github.com";

		const TEMPLATES = [
			[
				/^(https?):\/\/gitlab\.com\/([^\/]+.*\/[^\/]+)\/(?:raw|blob)\/(.+?)(?:\?.*)?$/i,
				"$1://gl.githack.com/$2/raw/$3",
			],
			[
				/^(https?):\/\/bitbucket\.org\/([^\/]+\/[^\/]+)\/(?:raw|src)\/(.+?)(?:\?.*)?$/i,
				"$1://bb.githack.com/$2/raw/$3",
			],

			// snippet file URL from web interface, with revision
			[
				/^(https?):\/\/bitbucket\.org\/snippets\/([^\/]+\/[^\/]+)\/revisions\/([^\/\#\?]+)(?:\?[^#]*)?(?:\#file-(.+?))$/i,
				"$1://bb.githack.com/!api/2.0/snippets/$2/$3/files/$4",
			],
			// snippet file URL from web interface, no revision
			[
				/^(https?):\/\/bitbucket\.org\/snippets\/([^\/]+\/[^\/\#\?]+)(?:\?[^#]*)?(?:\#file-(.+?))$/i,
				"$1://bb.githack.com/!api/2.0/snippets/$2/HEAD/files/$3",
			],
			// snippet file URLs from REST API
			[
				/^(https?):\/\/bitbucket\.org\/\!api\/2.0\/snippets\/([^\/]+\/[^\/]+\/[^\/]+)\/files\/(.+?)(?:\?.*)?$/i,
				"$1://bb.githack.com/!api/2.0/snippets/$2/files/$3",
			],
			[
				/^(https?):\/\/api\.bitbucket\.org\/2.0\/snippets\/([^\/]+\/[^\/]+\/[^\/]+)\/files\/(.+?)(?:\?.*)?$/i,
				"$1://bb.githack.com/!api/2.0/snippets/$2/files/$3",
			],

			// welcome rawgit refugees
			[
				/^(https?):\/\/(?:cdn\.)?rawgit\.com\/(.+?\/[0-9a-f]+\/raw\/(?:[0-9a-f]+\/)?.+)$/i,
				"$1://gist.githack.com/$2",
			],
			[
				/^(https?):\/\/(?:cdn\.)?rawgit\.com\/([^\/]+\/[^\/]+\/[^\/]+|[0-9A-Za-z-]+\/[0-9a-f]+\/raw)\/(.+)/i,
				"$1://raw.githack.com/$2/$3",
			],

			[
				/^(https?):\/\/raw\.github(?:usercontent)?\.com\/([^\/]+\/[^\/]+\/[^\/]+|[0-9A-Za-z-]+\/[0-9a-f]+\/raw)\/(.+)/i,
				"$1://raw.githack.com/$2/$3",
			],
			[
				/^(https?):\/\/github\.com\/(.[^\/]+?)\/(.[^\/]+?)\/(?!releases\/)(?:(?:blob|raw)\/)?(.+?\/.+)/i,
				"$1://raw.githack.com/$2/$3/$4",
			],
			[
				/^(https?):\/\/gist\.github(?:usercontent)?\.com\/(.+?\/[0-9a-f]+\/raw\/(?:[0-9a-f]+\/)?.+)$/i,
				"$1://gist.githack.com/$2",
			],

			[
				/^(https?):\/\/git\.sr\.ht\/(~[^\/]+\/[^\/]+\/blob\/.+\/.+)/i,
				"$1://srht.githack.com/$2",
			],
			[
				/^(https?):\/\/hg\.sr\.ht\/(~[^\/]+\/[^\/]+\/raw\/.+)/i,
				"$1://srhgt.githack.com/$2",
			],
		];

		function mergeSlashes(url) {
			try {
				var url = new URL(url);
			} catch (e) {
				return url;
			}
			url.pathname = url.pathname.replace(/\/\/+/gi, "/");
			return url.toString();
		}

		function maybeConvertUrl(url) {
			for (var i in TEMPLATES) {
				var [pattern, template] = TEMPLATES[i];
				if (pattern.test(url)) {
					return url.replace(pattern, template);
				}
			}
		}

		function cdnize(url) {
			return url.replace(/^(\w+):\/\/(\w+)/, "$1://$2cdn");
		}

		function onFocus(e) {
			setTimeout(function () {
				e.target.select();
			}, 1);
		}

		function hide(element) {
			element.classList.add("hidden");
		}

		function show(element) {
			element.classList.remove("hidden");
		}

		var ghUrl = maybeConvertUrl(url);
		if (ghUrl) {
			var matches = ghUrl.match(
				/^(\w+:\/\/(raw).githack.com\/([^\/]+)\/([^\/]+))\/([^\/]+)\/(.*)/i
			);
			if (!matches) {
				resolve({ dev: ghUrl, prod: cdnize(ghUrl) });
			} else if (matches[2] === "raw") {
				let apiUrl = `${GITHUB_API_URL}/repos/${matches[3]}/${matches[4]}/git/refs/heads/${matches[5]}`;
				fetch(apiUrl)
					.then((res) => {
						if (res.ok) return res.json();
					})
					.then((data) => {
						let ref =
							data && data.object && data.object.sha
								? data.object.sha
								: matches[5];
						resolve({
							prod: cdnize(`${matches[1]}/${ref}/${matches[6]}`),
							dev: ghUrl,
						});
					});
			}
		}
	});
}
