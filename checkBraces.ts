import fs from 'fs';

const fileContent = fs.readFileSync('server.ts', 'utf8');

let braceCount = 0;
let inString = false;
let stringChar = '';
let inSingleLineComment = false;
let inMultiLineComment = false;
let lineNum = 1;

let opens: { line: number; text: string }[] = [];

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
    const lines = fileContent.split('\n');
    opens.push({ line: lineNum, text: lines[lineNum - 1].trim() });
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
    console.log(`Line ${op.line}: ${op.text}`);
  });
}
