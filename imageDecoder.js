import {dumpEveryByte} from "./util.js";
import {Blob} from 'buffer';
import * as fs from 'fs';

const r3pSize = 0x0520;
const bmpPixelNum = r3pSize * 2;
const r3pBodyOffset = 0x0036;
const bitNumPerByte = 8;

const getRGB = (paletteIndex) => {
    return [
        [ 0x48, 0x40, 0xA8 ],
        [ 0x70, 0x70, 0xD8 ],
        [ 0xB8, 0xC0, 0xF8 ],
        [ 0x28, 0x68, 0x10 ],
        [ 0x60, 0xA0, 0x38 ],
        [ 0xA0, 0xD8, 0x60 ],
        [ 0xF0, 0xF0, 0xD0 ],
        [ 0xF8, 0xD0, 0x90 ],
        [ 0x90, 0x80, 0x68 ],
        [ 0xB0, 0x68, 0x20 ],
        [ 0xE8, 0x98, 0x48 ],
        [ 0xF0, 0x68, 0x30 ],
        [ 0xC8, 0x48, 0x28 ],
        [ 0x90, 0x30, 0x20 ],
        [ 0x30, 0x30, 0x30 ],
        [ 0x01, 0x01, 0x01 ],
        [ 0xFF, 0xFF, 0xFF ],
    ][paletteIndex].reverse();
}

const dumpBitmapBytes = (r3pBody) => {
    [...Array(bmpPixelNum).keys()].map(idx => bitmapByte(r3pBody, idx)).map(byte => process.stdout.write(byte.toString(0x10)));
}

const dumpBitMapRGB = (r3pBody) => {
    [...Array(bmpPixelNum).keys()].map(idx => bitmapByte(r3pBody, idx)).map(halfByte => getRGB(halfByte).map(byte => process.stdout.write(byte.toString(0x10))));
}

const dumpBytes = (r3pBody) => {
    r3pBody.map(byte => process.stdout.write(byte.toString(0x10)));
}

const divideToBits = (byte) => {
    return [ ...Array(bitNumPerByte).keys() ].map(digit => takeBit(byte, digit));
}

const dumpBits = (r3pBody) => {
    r3pBody.map(byte => divideToBits(byte).map(bits => process.stdout.write(bits.toString())));
}

const getR3pBlockNo = (bmpIdx) => {
    return bmpIdx / bitNumPerByte | 0;
}

const getR3pIndex = (bmpIdx) => {
    return (getR3pBlockNo(bmpIdx) / 8 | 0) * 0x20 + (bmpIdx % 0x20) / 2;
}

const bitmapByte = (r3pBody, bmpIdx) => {
    return [ 0x00, 0x01, 0x10, 0x11 ]
        .map((adr, idx) => divideToBits(r3pBody[adr]).reverse())
        .reduce((prv, bits, idx) => {
            return prv + bits[bmpIdx % 8] << idx;
        });
}

const takeBit = (byte, digit=0) => {
    return (byte >> digit) & 0x01;
}

const reverseByteOrder = (byte) => {
    // リトルエンディアン
    return divideToBits(byte).reduce((prv, crt, idx) => prv + (crt << idx));
}


// 読み込み対象サイズ：0x520
const toBMP = (buf, bufIndex) => {
    //dumpBytes(buf.slice(r3pBodyOffset));
    //dumpBits(buf.slice(r3pBodyOffset));
    //dumpBitmapBytes(buf.slice(r3pBodyOffset));
    //dumpBitMapRGB(buf.slice(r3pBodyOffset));
    const offset = 0x0000;
    console.log(offset.toString(0x10) + ":" + bitmapByte(buf, offset).toString(0x10));


    // let bytes = [8 * 8 * 8 * 4];
    // for (let i = 0; i < 8; i++) {
    //     for (let j = 0; j < 8; j++) {
    //         const bits = [
    //             divideToBits(buf[bufIndex + ((i * 2) + j * 2)]),
    //             divideToBits(buf[bufIndex + 1 + ((i * 2) + j * 2)]),
    //             divideToBits(buf[bufIndex + 0x10 + ((i * 2) + j * 2)]),
    //             divideToBits(buf[bufIndex + 0x10 + 1 + ((i * 2) + j * 2)]),
    //         ];
    //         for (let k = 0; k < 8; k++) {
    //             const color = (bits[3][k] << 3) + (bits[2][k] << 2) + (bits[1][k] << 1) + bits[0][k];
    //             bytes[BMPAdrs(i, j ,k)] = colorPalette[color][0];
    //             bytes[BMPAdrs(i, j ,k) + 1] = colorPalette[color][1];
    //             bytes[BMPAdrs(i, j ,k) + 2] = colorPalette[color][2];
    //             bytes[BMPAdrs(i, j ,k) + 3] = 0x00;
    //         }
    //     }
    // }
    //
    // const BMP_HEADER_BASE64 = 'Qk0AAAAAAAAAAHoAAABsAAAAAAAAAAAAAAABACAAAwAAAAAAAADDDgAAww4AAAAAAAAAAAAA/wAAAAD/AAAAAP8AAAAA/0JHUnM';
    // const BMP_HEADER = Uint8Array.from(atob(BMP_HEADER_BASE64), (c) => c.charCodeAt(0));
    // const BMP_HEADER_LENGTH = 122;
    // const BMP_FILESIZE_OFFSET = 2;
    // const BMP_WIDTH_OFFSET = 18;
    // const BMP_HEIGHT_OFFSET = 22;
    // const BMP_IMAGESIZE_OFFSET = 34;
    //
    // const result = new Uint8Array(bytes.length);
    //
    // // result.set(BMP_HEADER);
    // const dataView = new DataView(result.buffer);
    // // dataView.setUint32(BMP_FILESIZE_OFFSET, BMP_HEADER_LENGTH + bytes.length, true);
    // // dataView.setUint32(BMP_WIDTH_OFFSET, 8, true);
    // // dataView.setInt32(BMP_HEIGHT_OFFSET, 1, true);
    // // dataView.setUint32(BMP_IMAGESIZE_OFFSET, bytes.length, true);
    //
    // result.set(bytes, 0);
    //
    // fs.writeFile("out/out.bmp", dataView, (err) => {
    //     if (err) throw err;
    //     console.log('正常に書き込みが完了しました');
    // });
}

const offset = 0x0038;

dumpEveryByte({offset: offset, size: 1, converter: toBMP});


