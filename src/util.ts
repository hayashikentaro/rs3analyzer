import * as fs from 'fs';
import {Byte, createByte} from "./byte";

export const dump: (offset :number, converter :(buf: Byte[]) => void) => void =
  (offset, converter) => {
      fs.readFile('in/r3p', (err, content) => {
          converter(Array.from(content).slice(offset).map((num) => createByte(num)));
      });
}

export const writeFile: (fileName: string, bytes: number[]) => void = (fileName, bytes) => {
    fs.writeFile(
        fileName,
        new DataView(new Uint8Array((bytes.map((byte) => byte))).buffer),
        (err) => {
            if (err) throw err;
            console.log('creating bmp files was succeeded!!');
        }
    );
}
