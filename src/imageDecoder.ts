import {dump, writeFile} from "./util";
import * as fs from 'fs';
import {bitPerByte, Byte, createByte} from "./byte";

// TODO: 動的ロードに置換
const bytesOfRGBA = (paletteIndex :number) => {
    const alphaChannelByte = 0x00;
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

interface Bitmap {
    header: Byte[];
    body: Byte[];
    bytes: Byte[];
    buffer: ArrayBuffer;
    size: number;
    width: number;
    height: number;
}

const createBitmapOfBlock :(bytes :Byte[]) => Bitmap = (bytes) => {
    const bitmapHeaderOfBlock = (params: { width :number, height :number}) => {
        const headerSize = 0x36;
        const bytePerPixel = 4;
        const bodySize = params.width * params.height * bytePerPixel;
        const Uint32ToBytes :(uint32 :number) => number[] = (uint32) => {
            return [...Array(4).keys()].map((idx) => (uint32 >> idx) & 0xFF)
        }

        return [
            // ファイルタイプ
            0x42, 0x4D,
            // ファイルサイズ
            ...Uint32ToBytes(headerSize + bodySize),
            // 予約領域１
            0x00, 0x00,
            // 予約領域２
            0x00, 0x00,
            // ファイル先頭から画像データまでのオフセット
            headerSize, 0x00, 0x00, 0x00,
            // 情報ヘッダサイズ[byte]
            0x28, 0x00, 0x00, 0x00,
            // 画像の幅
            params.width, 0x00, 0x00, 0x00,
            // 画像の高さ
            params.height, 0x00, 0x00, 0x00,
            // プレーン数
            0x01, 0x00,
            // 色ビット数
            0x20, 0x00,
            // 圧縮形式
            0x00, 0x00, 0x00, 0x00,
            // 画像データサイズ
            ...Uint32ToBytes(bodySize),
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

    const header = bitmapHeaderOfBlock({ width: 8, height: 8 }).map((byte => createByte(byte)));
    return {
        header: header,
        body: bytes,
        bytes: header.concat(bytes),
        buffer: new Uint8Array(header.concat(bytes).map((byte) => byte.value)).buffer,
        size: bytes.length,
        width: 8,
        height: 8,
    }
}

interface Snes4bppBlock {
    bytes: Byte[];
    toBitMap: () => Bitmap;
}

const createSnes4bppBlock :(bytes :Byte[]) => Snes4bppBlock = (bytes) => {
    const bitmapBlockSize = 0x40;
    const snes4bppNeighborByteNum = 0x02;
    // r3pからビットマップ用のパレットインデックスを取り出す
    const getBitmapColorIndex = (snes4bppBody :Byte[], bmpIdx :number) => {
        const snes4bppReadOffset = (bitmapPixelIndex :number) => {
          return ((bitmapBlockSize - 1 - bitmapPixelIndex) / bitPerByte | 0) * snes4bppNeighborByteNum;
        }

        return [ 0x00, 0x01, 0x10, 0x11 ]
            .map(adr => snes4bppReadOffset(bmpIdx) + adr)
            .map(adr => snes4bppBody[adr])
            .map(byte => byte.bit(bmpIdx % bitPerByte))
            .reduce((prv, bit, idx) => {
                return prv + (bit << idx);
            });
    }

    return {
        bytes: bytes,
        toBitMap: function(): Bitmap {
            return createBitmapOfBlock(
                [...Array(bitmapBlockSize).keys()].map(
                    (pixelIndex) => getBitmapColorIndex(this.bytes, pixelIndex)
                ).flatMap((paletteIndex) => bytesOfRGBA(paletteIndex))
                .map((raw) => createByte(raw))
            );
        }
    }
}

// 読み込み対象サイズ：0x520
const convertBitmap = (buf :Byte[]) => {
    [...Array(36).keys()].map((idx) => {
        writeFile(`out/out${idx}.bmp`,
            createSnes4bppBlock(
                buf.slice(idx * 0x20, (idx + 1) * 0x20)
            ).toBitMap().buffer
        )
    });
}

// TODO: r3pじゃなくなったら修正
const r3pBodyOffset = 0x0036;

dump(r3pBodyOffset, convertBitmap);


