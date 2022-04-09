import * as fs from 'fs';

const outputEveryByte = ({content, offset, size, converter}) => {
    [...Array(size).keys()].map((idx) => converter(content, offset + idx));
}

const dump = ({offset, size, output, converter}) => {
    fs.readFile('in', (err, content) => {
        output({content: content, offset: offset, size: size, converter: converter});
    });
}

export const dumpEveryByte = ({offset, size, converter}) => {
    dump({offset: offset, size: size, output: outputEveryByte, converter: converter});
}
