import * as fs from 'fs';

export const dump = ({offset, converter}) => {
    fs.readFile('in', (err, content) => {
        converter(content.slice(offset));
    });
}
