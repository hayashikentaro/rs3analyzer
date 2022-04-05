import * as fs from 'fs'

export const readRom = (outfn) => {
    fs.readFile('rom', (err, content) => {
        return outfn(content);
    })
};
