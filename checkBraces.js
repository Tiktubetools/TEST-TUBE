const fs = require('fs');

const fileContent = fs.readFileSync('server.ts', 'utf8');

let braceCount = 0;
let inString = false;
let stringChar = '';
let inSingleLineComment = false;
let inMultiLineComment = false;
let lineNum = 1;
let lastBraceLineNum = null;
let lastBraceChar = '';

// Track brace history with lines so we know exactly where each was opened
let opens = [];

for (let i = 0; i < fileContent.length; i++) {
  const char = fileContent[i];
  const nextChar = fileContent[i + 1] || '';

  if (char === '\n') {
    lineNum++;
    inSingleLineComment = false;
    continue;
  }

  if (inSingleLineComment) {
    continue;
  }

  if (inMultiLineComment) {
    if (char === '*' && nextChar === '/') {
      inMultiLineComment = false;
      i++;
    }
    continue;
  }

  if (inString) {
    if (char === '\\') {
      i++; // Skip escape
      continue;
    }
    if (char === stringChar) {
      inString = false;
    }
    continue;
  }

  // Detect string starts
  if (char === '"' || char === "'" || char === '`') {
    inString = true;
    stringChar = char;
    continue;
  }

  // Detect comments
  if (char === '/' && nextChar === '/') {
    inSingleLineComment = true;
    i++;
    continue;
  }
  if (char === '/' && nextChar === '*') {
    inMultiLineComment = true;
    i++;
    continue;
  }

  if (char === '{') {
    braceCount++;
    opens.push({ line: lineNum, index: i });
  } else if (char === '}') {
    braceCount--;
    if (opens.length > 0) {
      opens.pop();
    } else {
      console.log(`Unmatched closing brace at line ${lineNum}`);
    }
  }
}

console.log(`Final brace count: ${braceCount}`);
console.log(`Total open braces tracked: ${opens.length}`);
if (opens.length > 0) {
  console.log('Unclosed braces opened at lines:');
  opens.forEach(op => {
    // Show surrounding lines
    const contentLines = fileContent.split('\n');
    const startLine = Math.max(0, op.line - 1);
    const endLine = Math.min(contentLines.length, op.line + 2);
    console.log(`--- Unclosed open brace near line ${op.line} ---`);
    for (let l = startLine; l < endLine; l++) {
      console.log(`${l + 1}: ${contentLines[l]}`);
    }
  });
}
