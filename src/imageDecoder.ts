import {dump} from "./util";
import * as fs from 'fs';
import {bitPerByte, Byte, createByte} from "./byte";

const snes4bppSize = 0x0520;
const snes4bppBodyOffset = 0x0036;
const alphaChannelByte = 0x00;

// TODO: 動的ロードに置換
const getRGB = (paletteIndex :number) => {
    // リトルエンディアンのため反転
    return [
        [ 0x18, 0x30, 0x38 ],
        [ 0xF0, 0xF0, 0xD0 ],
        [ 0x30, 0x30, 0x30 ],
        [ 0x00, 0x00, 0x00 ],
        [ 0x58, 0xA8, 0x38 ],
        [ 0x00, 0x70, 0x00 ],
        [ 0xF8, 0xC8, 0x80 ],
        [ 0xD8, 0x98, 0x58 ],
        [ 0xA8, 0x68, 0x48 ],
        [ 0xC8, 0x48, 0x10 ],
        [ 0x90, 0x20, 0x08 ],
        [ 0x00, 0x70, 0x00 ],
        [ 0xB0, 0xD0, 0xE8 ],
        [ 0x40, 0x40, 0xC8 ],
        [ 0x88, 0x78, 0xF8 ],
        [ 0x90, 0xE8, 0x38 ],
    ][paletteIndex].reverse().concat(alphaChannelByte);
}
// TODO:
// @ts-ignore
const bitmapHeaderOfBlock = () => {
    const headerSize = 0x36;
    return [
        // ファイルタイプ
        0x42, 0x4D,
        // TODO: ファイルサイズ
        0x38,
        0x01,
        0x00,
        0x00,
        // 予約領域１
        0x00, 0x00,
        // 予約領域２
        0x00, 0x00,
        // ファイル先頭から画像データまでのオフセット
        headerSize, 0x00, 0x00, 0x00,
        // 情報ヘッダサイズ[byte]
        0x28, 0x00, 0x00, 0x00,
        // TODO: 画像の幅
        0x08,
        0x00,
        0x00,
        0x00,
        // TODO: 画像の高さ
        0x08,
        0x00,
        0x00,
        0x00,
        // プレーン数
        0x01, 0x00,
        // 色ビット数
        0x20, 0x00,
        // 圧縮形式
        0x00, 0x00, 0x00, 0x00,
        // TODO: 画像データサイズ
        0x02,
        0x01,
        0x00,
        0x00,
        // 水平解像度
        0x12, 0x0B, 0x00, 0x00,
        // 垂直解像度
        0x12, 0x0B, 0x00, 0x00,
        // 格納パレット数
        0x00, 0x00, 0x00, 0x00,
        // 重要色数
        0x00, 0x00, 0x00, 0x00,
    ];
}

const snes4bppNeighborByteNum = 0x02;
const bitmapBlockSize = 0x40;
const snes4bppBlockSize = 0x20;

interface Bitmap {
    header: Byte[];
    body: Byte[];
    size: number;
    width: number;
    height: number;
}

const createBitmapOfBlock :(bytes :Byte[]) => Bitmap =
  (bytes) => {
    return {
        header: bitmapHeaderOfBlock().map((byte => createByte(byte))),
        body: bytes,
        size: bytes.length,
        width: 8,
        height: 8,
    }
}
interface Snes4bppBlock {
    bytes: Byte[];
    toBitMap: () => Bitmap;
}

const createSnes4bppBlock :(bytes :Byte[]) => Snes4bppBlock =
  (bytes) => {
    return {
        bytes: bytes,
        toBitMap: function(): Bitmap {
            return createBitmapOfBlock(
              [...Array(0x40).keys()].map(
                (pixelIdx) => getBitmapColorIndex(this.bytes, pixelIdx)
              ).flatMap((idx) => getRGB(idx))
                .map((raw) => createByte(raw))
            );
        }
    }
}

const snes4bppReadOffsetInBlock = (bitmapPixelIndex :number) => {
    return ((bitmapBlockSize - 1 - (bitmapPixelIndex % bitmapBlockSize)) / bitPerByte | 0) * snes4bppNeighborByteNum;
}

const snes4bppBlockNo = (bitmapPixelIndex :number) => {
    return ((bitmapPixelIndex / bitmapBlockSize) | 0);
}

const snes4bppReadOffset = (bitmapPixelIndex :number) => {
    return snes4bppBlockNo(bitmapPixelIndex) * snes4bppBlockSize + snes4bppReadOffsetInBlock(bitmapPixelIndex);
}

// r3pからビットマップ用のパレットインデックスを取り出す
const getBitmapColorIndex = (snes4bppBody :Byte[], bmpIdx :number) => {
    return [ 0x00, 0x01, 0x10, 0x11 ]
        .map(adr => snes4bppReadOffset(bmpIdx) + adr)
        .map(adr => snes4bppBody[adr])
        .map(byte => byte.bit(bmpIdx % bitPerByte))
        .reduce((prv, bit, idx) => {
            return prv + (bit << idx);
        });
}

const getBitmapColorIndexes = (snes4bppBody :Byte[], blockIdx :number) => {
    return [...Array(0x40).keys()].map((pixelIdx) => {
        return getBitmapColorIndex(snes4bppBody, blockIdx * 0x40 + pixelIdx);
    })
}

const getBitmapBodyAsBlock = (snes4bppBody :Byte[], blockIdx :number) => {
    return getBitmapColorIndexes(snes4bppBody, blockIdx).flatMap(idx => getRGB(idx));
}

// 読み込み対象サイズ：0x520
const toBMP = (buf :Byte[]) => {
    [...Array(36).keys()].map((idx) => {
        const bytes = getBitmapBodyAsBlock(buf, idx);
        const header = bitmapHeaderOfBlock();
        let result = new Uint8Array(header.length + bytes.length);
        result.set(header);
        const dataView = new DataView(result.buffer);
        result.set(bytes, header.length);

        fs.writeFile(`out/out${idx}.bmp`, dataView, (err) => {
            if (err) throw err;
            console.log('creating bmp files was succeeded!!');
        });
    })
}

dump(snes4bppBodyOffset, toBMP);


