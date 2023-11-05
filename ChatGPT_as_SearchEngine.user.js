// ==UserScript==
// @name         ChatGPT Auto Send
// @namespace    mailto:explosionscratch@gmail.com
// @version      0.1
// @description  Auto send messages to ChatGPT based on query parameters.
// @author       You
// @match        https://chat.openai.com/*
// @match        https://claude.ai/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=openai.com
// @require      https://raw.githubusercontent.com/kudoai/chatgpt.js/main/dist/chatgpt-2.0.2.min.js
// @grant        none
// @run-at       document-idle
// ==/UserScript==

/* Copyright (C) Sep 15, 2023 Explosion-Scratch - All Rights Reserved
 * You may use, distribute and modify this code under the
 * terms of the Attribution-ShareAlike 4.0 International license.
 *
 * You should have received a copy of the Attribution-ShareAlike
 * 4.0 International license with this file. If not, please write
 * to: explosionscatch@gmail.com, or visit:
 * https://creativecommons.org/licenses/by-sa/4.0/
 */
const PROMPTS = {
  short:
    "Summarize the following YouTube video transcript into a well formatted, easy to read, engaging and informative article. Make sure to cover everything covered in the video transcript. Bold important terms, and use markdown formatting such as latex equations. Make sure to cover all the key terms, definitions and equations from the video transcript. \n\nTranscript: $TRANSCRIPT\nRemember: Your article should be explanatory, informative, engaging, well written, and easy to understand.",
  article: `Act as an expert copywriter specializing in content optimization for SEO. Your task is to take a given YouTube transcript and transform it into a well-structured and engaging article. Your objectives are as follows:

Content Transformation: Begin by thoroughly reading the provided YouTube transcript. Understand the main ideas, key points, and the overall message conveyed.

Sentence Structure: While rephrasing the content, pay careful attention to sentence structure. Ensure that the article flows logically and coherently.

Keyword Identification: Identify the main keyword or phrase from the transcript. It's crucial to determine the primary topic that the YouTube video discusses.

Keyword Integration: Incorporate the identified keyword naturally throughout the article. Use it in headings, subheadings, and within the body text. However, avoid overuse or keyword stuffing, as this can negatively affect SEO.

Unique Content: Your goal is to make the article 100% unique. Avoid copying sentences directly from the transcript. Rewrite the content in your own words while retaining the original message and meaning.

SEO Friendliness: Craft the article with SEO best practices in mind. This includes optimizing meta tags (title and meta description), using header tags appropriately, and maintaining an appropriate keyword density.

Engaging and Informative: Ensure that the article is engaging and informative for the reader. It should provide value and insight on the topic discussed in the YouTube video.

Formatting: The article should be easy to skim. Bold important terms, use markdown callouts, tables and latex equations, remain engaging and informative. Make the writing flow well.

Proofreading: Proofread the article for grammar, spelling, and punctuation errors. Ensure it is free of any mistakes that could detract from its quality.

Explanatory: Your article should be very explanatory and help readers understand the YouTube video as easily as possible.

By following these guidelines, create a well-optimized, unique, and informative article that would rank well in search engine results and engage readers effectively.

Transcript: $TRANSCRIPT`,
  // Remember to follow markdown formatting rules for subheadings, headings, bold and italics, bullet points, tables, and callouts for tips/quotes/possible questions, etc. Use latex for equations. Bold terms and keywords that readers should learn from the video.`,

  article_new: `Act as an expert copywriter specializing in content optimization for SEO. Your task is to take a given YouTube transcript and transform it into a well-structured and engaging article. Your objectives are as follows:

Content Transformation: Begin by thoroughly reading the provided YouTube transcript. Understand the main ideas, key points, and the overall message conveyed.

Sentence Structure: While rephrasing the content, pay careful attention to sentence structure. Ensure that the article flows logically and coherently.

Keyword Identification: Identify the main keyword or phrase from the transcript. It's crucial to determine the primary topic that the YouTube video discusses.

Keyword Integration: Incorporate the identified keyword naturally throughout the article. Use it in headings, subheadings, and within the body text. However, avoid overuse or keyword stuffing, as this can negatively affect SEO.

Unique Content: Your goal is to make the article 100% unique. Avoid copying sentences directly from the transcript. Rewrite the content in your own words while retaining the original message and meaning.

SEO Friendliness: Craft the article with SEO best practices in mind. This includes optimizing meta tags (title and meta description), using header tags appropriately, and maintaining an appropriate keyword density.

Engaging and Informative: Ensure that the article is engaging and informative for the reader. It should provide value and insight on the topic discussed in the YouTube video.

Formatting: The article should be easy to skim. Bold important terms, use markdown callouts, tables and latex equations, and bullet points, remain engaging and informative. Make the writing flow well.

Proofreading: Proofread the article for grammar, spelling, and punctuation errors. Ensure it is free of any mistakes that could detract from its quality.

Explanatory: Your article should be very explanatory and help readers understand the YouTube video as easily as possible.

Grammar guidelines: The article should contain rich and comprehensive, very detailed paragraphs, with lots of details. Do not echo my prompt. Do not remind me what I asked you for. Do not apologize. Do not self-reference. Do not use generic filler phrases.  Use useful subheadings with informative titles. Get to the point precisely and accurately. Do not explain what and why, just give me your best possible article. Write in active voice as like as human-like style, simple English, using contractions, idioms, transitional phrases, interjections, dangling modifiers, and colloquialisms and avoiding repetitive phrases and unnatural grammatically correct sentence structure. You have to write the article using an active voice. Avoid all grammatical mistakes.

By following these guidelines, create a well-optimized, unique, and informative article that would rank well in search engine results and engage readers effectively.

Transcript: $TRANSCRIPT

Use a mix of the writing styles of Andrej Karpathy, JK Rowling, Richard Feynman, David Brooks, Charles M. Blow and Alex Murrell. Remember to follow markdown formatting rules for subheadings, headings, bold and italics, bullet points, tables, and callouts for tips/quotes/possible questions, etc. Bold terms and keywords that readers should learn from the video.`,
};

(async function () {
  await new Promise((r) => setTimeout(r, Math.random() * 500));
  await until(
    () => chatgpt?.getTextarea() || document.querySelector(".ProseMirror"),
  );
  if (new URLSearchParams(location.search).get("query")) {
    console.log("Query:", new URLSearchParams(location.search).get("query"));
    sendMsg(
      "Use simple bullet points in your response. Be concise and readable. Indent bullet points and bold important sections. Be as concise as possible. Answer the prompt exactly:\n\nPrompt: " +
        new URLSearchParams(location.search).get("query"),
    );
  }
  if (new URLSearchParams(location.search).get("copied")) {
    let text = await navigator.clipboard.readText();
    text = text.trim();
    console.log("Query: ", text);
    if (new URLSearchParams(location.search).get("transcript")) {
      text = PROMPTS.short.replaceAll("$TRANSCRIPT", text);
      let style = document.createElement("style");
      style.innerHTML = `
[data-testid=conversation-turn-2] {display: none}

[data-testid=conversation-turn-3] > div > .flex > div:not(:nth-of-type(2)) {
   display: none;
}
[data-testid=conversation-turn-3] {background: white !important;}
[data-testid=conversation-turn-3] .flex.justify-between.lg\:block {
   display: none;
}
header {
   opacity: 0;
   transition: opacity .3s ease;
}
header:hover {opacity: 1;}

.absolute .text-gray-600 {opacity: 0;}

[data-projection-id='143'] button {
   font-size: 0;
}
`;
      document.head.appendChild(style);
    }
    sendMsg(text);
  }
  chatgpt?.sidebar?.hide();
})();

function sendMsg(msg) {
  //  console.log('Sending message:', msg);
  //  return;
  if (location.host.includes("chat.openai.com")) {
    chatgpt.sendInNewChat(msg);
  } else if (location.host.includes("claude.ai")) {
    document.querySelector(".ProseMirror").editor.commands.insertContent(msg);
    setTimeout(() => {
      document.querySelector("button").click();
    }, 10);
  } else {
    console.log(location.host + " not supported");
  }
}
function until(condition, wait = Infinity) {
  return new Promise(async (resolve, reject) => {
    let startTime = Date.now();
    while (!condition()) {
      if (Date.now() - startTime >= wait) {
        reject(condition());
        return;
      }
      await new Promise((res) => requestAnimationFrame(res));
    }
    resolve(condition());
    return condition();
  });
}
