#!/usr/bin/env node
/**
 * Post-build script: generates dist/index-en.html from dist/index.html
 * with English meta tags, title, and structured data for meltvalue.co.za.
 */
const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '..', 'dist', 'index.html');
const dest = path.resolve(__dirname, '..', 'dist', 'index-en.html');

let html = fs.readFileSync(src, 'utf-8');

// Language
html = html.replace('lang="af"', 'lang="en"');

// Title
html = html.replace('<title>Smeltwaarde</title>', '<title>Melt Value</title>');

// OG
html = html.replace(
  'og:title" content="Smeltwaarde"',
  'og:title" content="Melt Value"'
);
html = html.replace(
  'og:description" content="Bereken die smeltwaarde van Suid-Afrikaanse silwer en goue munte."',
  'og:description" content="Calculate the melt value of South African silver and gold coins."'
);
html = html.replace(
  'og:url" content="https://smeltwaarde.co.za/"',
  'og:url" content="https://meltvalue.co.za/"'
);

// Twitter
html = html.replace(
  'twitter:title" content="Smeltwaarde"',
  'twitter:title" content="Melt Value"'
);
html = html.replace(
  'twitter:description" content="Bereken die smeltwaarde van Suid-Afrikaanse silwer en goue munte."',
  'twitter:description" content="Calculate the melt value of South African silver and gold coins."'
);

// Meta description
html = html.replace(
  'name="description" content="Bereken die smeltwaarde van Suid-Afrikaanse silwer en goue munte."',
  'name="description" content="Calculate the melt value of South African silver and gold coins."'
);

// Structured data (JSON-LD)
html = html.replace(
  /"name":\s*"Smeltwaarde"/,
  '"name": "Melt Value"'
);
html = html.replace(
  /"url":\s*"https:\/\/smeltwaarde\.co\.za"/,
  '"url": "https://meltvalue.co.za"'
);
html = html.replace(
  /"description":\s*"Bereken die smeltwaarde van Suid-Afrikaanse silwer en goue munte\."/,
  '"description": "Calculate the melt value of South African silver and gold coins."'
);

fs.writeFileSync(dest, html, 'utf-8');
console.log('Generated dist/index-en.html');
