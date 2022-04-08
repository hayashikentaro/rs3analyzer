import {dumpEveryByte} from "./util.js";
import * as fs from 'fs';
import _ from "lodash";

const r3pSize = 0x0520;
const bmpPixelNum = r3pSize * 2;
const r3pBodyOffset = 0x0036;
const bitNumPerByte = 8;

Array.prototype.union = function (item) {
    return _.union(this, [item]);
}

const getRGB = (paletteIndex) => {
    // リトルエンディアンのため反転
    return [
        [ 0x18, 0x30, 0x38 ],
        [ 0xF0, 0xF0, 0xD0 ],
        [ 0x30, 0x30, 0x30 ],
        [ 0x00, 0x00, 0x00 ],
        [ 0x58, 0xA8, 0x38 ],
        [ 0x90, 0x20, 0x08 ],
        [ 0xF8, 0xC8, 0x80 ],
        [ 0xD8, 0x98, 0x58 ],
        [ 0xA8, 0x68, 0x48 ],
        [ 0xC8, 0x48, 0x10 ],
        [ 0xF8, 0x70, 0x18 ],
        [ 0x00, 0x70, 0x00 ],
        [ 0x90, 0xE8, 0x38 ],
        [ 0x40, 0x40, 0xC8 ],
        [ 0x88, 0x78, 0xF8 ],
        [ 0xB0, 0x78, 0xF8 ],
    ][paletteIndex].reverse().union(0x00);
}

const bitmapHeaderOfBlock = [
    0x42,
    0x4D,
    0x38,
    0x01,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x36,
    0x00,
    0x00,
    0x00,
    0x28,
    0x00,
    0x00,
    0x00,
    0x08,
    0x00,
    0x00,
    0x00,
    0x08,
    0x00,
    0x00,
    0x00,
    0x01,
    0x00,
    0x20,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x02,
    0x01,
    0x00,
    0x00,
    0x12,
    0x0B,
    0x00,
    0x00,
    0x12,
    0x0B,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
];

const dumpBitmapBytes = (r3pBody) => {
    [...Array(bmpPixelNum).keys()].map(idx => bitmapByte(r3pBody, idx)).map(byte => process.stdout.write(byte.toString(0x10)));
}

const dumpBitMapRGB = (r3pBody) => {
    [...Array(bmpPixelNum).keys()].map(idx => bitmapByte(r3pBody, idx)).map(halfByte => getRGB(halfByte).map(byte => process.stdout.write(byte.toString(0x10))));
}

const dumpBytes = (r3pBody) => {
    r3pBody.map(byte => process.stdout.write(byte.toString(0x10)));
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

const divideToBits = (byte) => {
    return [ ...Array(bitNumPerByte).keys() ].map(digit => takeBit(byte, digit));
}

// リトルエンディアン（小さい方から）
const takeBit = (byte, digit) => {
    return (byte >> (bitNumPerByte - 1 - digit)) & 0x01;
}

const reverseByteOrder = (byte) => {
    // リトルエンディアン
    return divideToBits(byte).reduce((prv, crt, idx) => prv + (crt << idx));
}

// r3pからビットマップ用のパレットインデックスを取り出す
const getBitmapColorIndex = (r3pBody, bmpIdx) => {
    return [ 0x00, 0x01, 0x10, 0x11 ]
        // 読み込みbyte移動
        .map(adr => adr + (bmpIdx / 8 | 0) * 0x02)
        // 読み込みbyte移動（改行・画像ブロック移動）
        .map(adr => adr + (bmpIdx / 0x40 | 0) * 0x10)
        .map(adr => r3pBody[adr])
        .map(byte => takeBit(byte, bmpIdx % 8))
        .reduce((prv, bit, idx) => {
            return prv + (bit << idx);
        });
}

const getBitmapColorIndexes = (r3pBody, blockIdx) => {
    return [...Array(0x40).keys()].map((pixelIdx) => {
        return getBitmapColorIndex(r3pBody, blockIdx * 0x40 + pixelIdx);
    })
}

const getBitmapBodyAsBlock = (r3pBody, blockIdx) => {
    return getBitmapColorIndexes(r3pBody, blockIdx).flatMap(idx => getRGB(idx));
}

// 読み込み対象サイズ：0x520
const toBMP = (buf, bufIndex) => {
    [...Array(12).keys()].map((idx) => {
        const bytes = getBitmapBodyAsBlock(buf, idx);
        let result = new Uint8Array(bitmapHeaderOfBlock.length + bytes.length);
        result.set(bitmapHeaderOfBlock);
        const dataView = new DataView(result.buffer);
        result.set(bytes, bitmapHeaderOfBlock.length);

        fs.writeFile(`out/out${idx}.bmp`, dataView, (err) => {
            if (err) throw err;
            console.log('正常に書き込みが完了しました');
        });
    }
)
}

const offset = r3pBodyOffset;

dumpEveryByte({offset: offset, size: 1, converter: toBMP});


