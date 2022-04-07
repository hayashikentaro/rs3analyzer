import * as fs from 'fs';

const outputEveryByte = ({content, offset, size, converter}) => {
    for (let i = 0; i < size; i++) {
        //console.log((offset + i).toString(16) + " : " + content[offset + i]);
        converter(content, offset + i);
    }
}

const dump = ({offset, size, output, converter}) => {
    fs.readFile('in', (err, content) => {
        output({content: content, offset: offset, size: size, converter: converter});
    });
}

export const dumpEveryByte = ({offset, size, converter}) => {
    dump({offset: offset, size: size, output: outputEveryByte, converter: converter});
}
