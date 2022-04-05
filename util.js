import * as fs from 'fs';

export const dump = (outfn) => {
    fs.readFile('rom', (err, content) => {
        return outfn(content);
    })
};
