import * as fs from 'fs';


const output = (content, offset, size, converter) => {
    for (let i = 0; i < size; i++) {
        console.log((offset + i).toString(16) + " : " + converter(content, offset + i));
    }
};

export const dump = (offset, size, converter) => {
    fs.readFile('rom', (err, content) => {
        return output(content, offset, size, converter);
    })
};
