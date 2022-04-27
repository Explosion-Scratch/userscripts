// ==UserScript==
// @name         Discord DontDelete
// @namespace    mailto:explosionscratch@gmail.com
// @source       https://github.com/Explosion-Scratch/userscripts/blob/main/Discord_DontDelete.user.js
// @updateURL    https://github.com/Explosion-Scratch/userscripts/raw/main/Discord_DontDelete.user.js
// @version      0.2
// @description  When someone deletes a discord message you'll still be able to see it until you close the page! =)
// @author       Explosion-Scratch
// @match        *://*.discord.com/*
// @icon         https://icons.duckduckgo.com/ip2/discord.com.ico
// @grant        none
// ==/UserScript==

(async () => {
    'use strict';
    let op = Element.prototype.removeChild;
    let s = document.createElement("style");
    s.innerHTML = `.DELETED_MESSAGE {opacity: .4;} .DELETED_MESSAGE, .DELETED_MESSAGE * {color: #f77 !important; cursor: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAQZJREFUOE/tlLFqQkEQRc8FSWFlkcoUFgE/QCR/kMIqpEoTMJVgq6W1pbZCqgTSpAqpUuQPQvADBAsLrVKkshBhZGGV9fHe8yli5XazO3N2mHt3xZGX0nhm1gZakZy+pF5SXSLQzBpAE/iMFN8BA0nPcdAN0MzyQCFIGgJvQD9S6Dp+BCrB/r+kuYtDYB14OXCkT5Jet4AuMLMiMAWqGcG/wJWk2Tp/a4anAJaBEvDtO7gFJsDIx3t36JS+B2oe8AV8AGuFz8DAhwm2OfoMnao3QNeL0gF+AtX3FmWXv08PvPSmXe5qzZ/ngLKkv6SndwE8ANcZgWPgXdIiFpgRkpqW+mMfcsEK3up7FasldMgAAAAASUVORK5CYII=), not-allowed !important;}`;
    document.head.appendChild(s);
    Element.prototype.removeChild = function(child){
        console.log("Child: ", child);
        if (this.getAttribute("data-list-id") === "chat-messages" && !child.querySelector("[class*=isSending]") && child.matches("[class*=messageListItem]")){
            return child.classList.add("DELETED_MESSAGE");
        } else {
            return op.call(this, child);
        }
    }
})();
