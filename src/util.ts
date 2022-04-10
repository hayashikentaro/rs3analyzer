import * as fs from 'fs';
import {Byte, createByte} from "./byte";

export const dump: (offset :number, converter :(buf: Byte[]) => void) => void =
  (offset, converter) => {
      fs.readFile('in', (err, content) => {
          converter(Array.from(content).slice(offset).map((num) => createByte(num)));
      });
}

export const writeFile: (fileName: string, buffer: ArrayBuffer) => void = (fileName, buffer) => {
    fs.writeFile(
        fileName,
        new DataView(buffer),
        (err) => {
            if (err) throw err;
            console.log('creating bmp files was succeeded!!');
        }
    );
}
