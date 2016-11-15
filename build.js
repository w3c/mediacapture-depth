#!/usr/local/bin/node
/*jshint node: true, browser: false*/

// build.js makes the spec Pubrules compliant.
// Run prior to committing changes with:
// $ node build.js
//
// The script touches the following files:
//
// ReSpec source (index.src.html):
// - tidy w/ tidyConfig
//
// Generated output (index.html):
// - convert AsciiMath to MathJax CommonHTML
// - move all <style> blocks to <head>
// - remove <style> blocks that fail css-validator
// - remove MathJax.js <script>
// - remove @font-face CSS at-rules
// - tidy w/ tidyConfig

var mjAPI = require("mathjax-node/lib/mj-page.js");
var jsdom = require("jsdom").jsdom;
var fs = require("fs");
var tidy = require("tidy-html5").tidy_html5;

var tidyConfig = {
  "char-encoding": "utf8",
  "drop-empty-elements": false,
  "drop-proprietary-attributes": false,
  "indent": true,
  "preserve-entities": true,
  "wrap": 80,
  "tidy-mark": false
};

var reSpecSource = fs.readFileSync("./index.src.html", "utf-8");

// tidy the ReSpec source and write to index.src.html
var reSpecSourceTidy = tidy(reSpecSource, tidyConfig);
fs.writeFileSync('index.src.html', reSpecSourceTidy, 'utf8');

var document = jsdom(reSpecSourceTidy);

mjAPI.start();

mjAPI.typeset({
  html: document.body.innerHTML,
  renderer: "CommonHTML",
  inputs: ["AsciiMath"]
}, function(result) {
  "use strict";
  document.body.innerHTML = result.html;
  
  // move <style id="MathJax_CHTML_styles"> to <head>
  document.head.appendChild(document.querySelector("#MathJax_CHTML_styles"));
  
  var HTML = "<!DOCTYPE html>\n" +
              document.documentElement.outerHTML.replace(/^(\n|\s)*/, "");

  // remove <style> blocks that fail css-validator
  var re1 = /.mjx-menclose > svg {fill: none; stroke: currentColor}\n/gi;
  var re2 = /.mjx-span {display: span}\n/gi;
  
  // remove the MathJax.js <script>
  var re3 = /\<script src="https:\/\/cdn.mathjax.org\/mathjax\/latest\/MathJax.js\?config=AM_CHTML"\>\n<\/script>/gi;

  var HTML = HTML.replace(re1, "").replace(re2, "").replace(re3, "");
    
  // tidy the generated output and write to index.html
  // Breaks (mostly indention) complex MathJax formulas. Disabled for now. 
  // var HTML = tidy(HTML, tidyConfig);

  fs.writeFileSync('index.html', HTML, 'utf8');
  
  process.exit();
});
