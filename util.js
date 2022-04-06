import * as fs from 'fs';


const outputEveryByte = (content, offset, size, converter) => {
    for (let i = 0; i < size; i++) {
        console.log((offset + i).toString(16) + " : " + converter(content, offset + i));
    }
};

const dump = (offset, size, output, converter) => {
    fs.readFile('rom', (err, content) => {
        return output(content, offset, size, converter);
    })
};

export const dumpEveryByte = (offset, size, converter) => {
    dump(offset, size, outputEveryByte, converter);
};
