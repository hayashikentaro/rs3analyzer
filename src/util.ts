import * as fs from 'fs';
import {Byte, ByteArray, bytesToBuffer, createByte} from "./byte";

export const dump: (offset :number, converter :(buf: ByteArray) => void) => void =
  (offset, converter) => {
    fs.readFile('in', (err, content) => {
        converter(Array.from(content).slice(offset).map((num) => createByte(num)));
    });
}

export const writeFile: (fileName: string, bytes: ByteArray) => void = (fileName, bytes) => {
    fs.writeFile(
        fileName,
        new DataView(bytesToBuffer(bytes)),
        (err) => {
            if (err) throw err;
            console.log('creating bmp files was succeeded!!');
        }
    );
}
