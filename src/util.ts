import * as fs from 'fs';
import {Byte, createByte} from "./byte";

type Converter = (buf: Byte[]) => void;

export const dump: (offset :number, converter :Converter) => void =
  (offset, converter) => {
    fs.readFile('in', (err: NodeJS.ErrnoException | null, content: Buffer) => {
        converter(Array.from(content).slice(offset).map((num) => createByte(num)));
    });
}
