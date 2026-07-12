const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

const pages = [
  {
    file: 'wenda/life-choice-framework.html',
    label: 'representative answer detail page',
    markers: [
      'data-geo-block="direct-answer"',
      'data-geo-block="answer-fact-card"',
      'data-geo-block="source-ledger"',
      'data-geo-block="usage-boundary"',
      'id="geo-direct-answer"',
      'id="geo-source-ledger"',
      '教育性决策支持',
      '"hasPart"',
      '"WebPageElement"',
      '"isBasedOn"',
    ],
  },
  {
    file: 'anli/startup-partner-or-solo.html',
    label: 'representative case detail page',
    markers: [
      'data-geo-block="case-summary"',
      'data-geo-block="decision-facts"',
      'data-geo-block="source-ledger"',
      'data-geo-block="usage-boundary"',
      'id="geo-case-summary"',
      'id="geo-source-ledger"',
      '教育性决策支持',
      '"hasPart"',
      '"WebPageElement"',
      '"isBasedOn"',
    ],
  },
];

const failures = [];

function fail(message) {
  failures.push(message);
}

function readPage(file) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) {
    fail(`${file} does not exist`);
    return '';
  }
  return fs.readFileSync(fullPath, 'utf8');
}

function verifyPage(page) {
  const html = readPage(page.file);
  if (!html) return;

  for (const marker of page.markers) {
    if (!html.includes(marker)) {
      fail(`${page.label} missing marker ${marker}`);
    }
  }

  const geoBlocks = (html.match(/data-geo-block="/g) || []).length;
  if (geoBlocks < 4) {
    fail(`${page.label} should expose at least four data-geo-block sections`);
  }
}

for (const page of pages) {
  verifyPage(page);
}

if (failures.length) {
  console.error(`GEO module verification failed with ${failures.length} issue(s):`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('GEO module verification passed.');
