
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const path = 'public/data/artists-metadata.json';
const data = JSON.parse(readFileSync(path, 'utf-8'));

if (data['cobalt']) {
    console.log('Removing cobalt...');
    delete data['cobalt'];
}
if (data['death-to-all']) {
    console.log('Removing death-to-all...');
    delete data['death-to-all'];
}

writeFileSync(path, JSON.stringify(data, null, 2));
console.log('Done.');
