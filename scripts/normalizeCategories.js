const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '../src/data/seedReadings.ts');
let code = fs.readFileSync(targetPath, 'utf8');

const match = code.match(/INITIAL_READINGS:\s*Omit<ReadingMaterial,\s*'id'>\[\]\s*=\s*(\[[\s\S]*\]);/);
if (match) {
  const readings = JSON.parse(match[1]);
  readings.forEach(r => {
    if (r.title.includes('Sherlock Holmes') || r.title.includes('The Gift of the Magi')) {
      r.category = 'literature';
    } else if (r.category === 'books') {
      r.category = 'stories';
    }
  });

  const outputCode = `import { ReadingMaterial } from '../types';

export const INITIAL_READINGS: Omit<ReadingMaterial, 'id'>[] = ${JSON.stringify(readings, null, 2)};
`;
  fs.writeFileSync(targetPath, outputCode, 'utf8');
  console.log('Successfully normalized categories in seedReadings.ts!');
}
