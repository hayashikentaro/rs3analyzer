import * as fs from 'fs';
import {Byte, createByte} from "./byte";

export const dump: (readFile :string, offset :number, converter :(buf: number[]) => void) => void =
  (readFile, offset, converter) => {
      fs.readFile(readFile, (err, content) => {
          converter(Array.from(content).slice(offset));
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

// TODO: 出力隠蔽、型が違っても統一
export const writeFileString: (fileName: string, bytes: string[]) => void = (fileName, bytes) => {
    fs.writeFile(
        fileName,
        bytes.reduce((prv, byte) => prv + byte, ""),
        (err) => {
            if (err) throw err;
            console.log('creating bmp files was succeeded!!');
        }
    );
}
