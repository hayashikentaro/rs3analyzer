
export const bitPerByte = 8;

export interface Byte {
  value: number;
  bit: (index :number) => number;
}

export interface ByteArray extends Array<Byte> {}

export const createByte: (raw: number) => Byte = (raw) => {
  return {
    value: raw & 0xFF,
    bit: function(index: number): number {
      return takeBit(this.value, index);
    },
  }
}

// リトルエンディアン（小さい方から）
const takeBit: (byte :number, digit: number) => number = (byte, digit) => {
  return (byte >> (bitPerByte - 1 - digit)) & 0x01;
}

export const bytesToBuffer :(bytes :ByteArray) => ArrayBuffer = (bytes) => {
  return new Uint8Array(bytes.map((byte) => byte.value)).buffer;
}