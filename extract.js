const fs = require('fs');
const readline = require('readline');

async function run() {
  const fileStream = fs.createReadStream('C:\\Users\\josem\\.gemini\\antigravity-ide\\brain\\a73cecaf-d000-49b2-9d1c-29e4e15a1dad\\.system_generated\\logs\\transcript_full.jsonl');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (line.includes('239.999995') && line.includes('base64')) {
      console.log('Found line matching SVG!');
      // Let's extract the base64 string
      const match = line.match(/base64,([^"]+)"/);
      if (match) {
        const base64Data = match[1];
        console.log('Extracted base64 string length:', base64Data.length);
        const buffer = Buffer.from(base64Data, 'base64');
        fs.writeFileSync('public/marvelous_designer_new.png', buffer);
        console.log('Successfully wrote public/marvelous_designer_new.png');
      } else {
        console.log('Base64 match not found in line.');
      }
    }
  }
}

run().catch(console.error);
