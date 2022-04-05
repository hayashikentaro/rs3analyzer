import * as fs from 'fs';


const print = (content, offset, out) => {
    for (let i = 0; i < 100; i++) {
        console.log((offset + i).toString(16) + " : " + out(content, offset + i));
    }
};

export const dump = (offset, out) => {
    fs.readFile('rom', (err, content) => {
        return print(content, offset, out);
    })
};
