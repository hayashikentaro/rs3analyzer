import * as fs from 'fs';

// @ts-ignore
export const dump = ({offset, converter}) => {
    fs.readFile('in', (err, content) => {
        // @ts-ignore
        converter(content.slice(offset));
    });
}
