import * as fs from 'fs';


const output = (content, offset, converter) => {
    for (let i = 0; i < 100; i++) {
        console.log((offset + i).toString(16) + " : " + converter(content, offset + i));
    }
};

export const dump = (offset, converter) => {
    fs.readFile('rom', (err, content) => {
        return output(content, offset, converter);
    })
};
