import fs from 'fs';
import zlib from 'zlib';

function createPng(width, height, r, g, b, a = 255) {
  // PNG signature
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 6; // Color type: 6 (RGBA)
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace

  const ihdr = makeChunk('IHDR', ihdrData);

  // Raw image data with filter byte 0 at start of each scanline
  const scanlineLength = width * 4 + 1;
  const rawData = Buffer.alloc(height * scanlineLength);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      // Draw amber border & dark slate background with beetle center
      const isBorder = x < 12 || x >= width - 12 || y < 12 || y >= height - 12;
      const distCenter = Math.hypot(x - width / 2, y - height / 2);
      const isCenterCircle = distCenter < width * 0.35;

      if (isBorder) {
        rawData[pixelOffset] = 245;     // R
        rawData[pixelOffset + 1] = 158; // G
        rawData[pixelOffset + 2] = 11;  // B (Amber-500)
        rawData[pixelOffset + 3] = 255;
      } else if (isCenterCircle) {
        rawData[pixelOffset] = 217;     // R
        rawData[pixelOffset + 1] = 119; // G
        rawData[pixelOffset + 2] = 6;   // B (Amber-600)
        rawData[pixelOffset + 3] = 255;
      } else {
        rawData[pixelOffset] = 15;      // R
        rawData[pixelOffset + 1] = 23;  // G
        rawData[pixelOffset + 2] = 42;  // B (Slate-900)
        rawData[pixelOffset + 3] = 255;
      }
    }
  }

  const deflated = zlib.deflateSync(rawData);
  const idat = makeChunk('IDAT', deflated);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = (c >>> 8) ^ table[(c ^ buf[i]) & 0xff];
  }
  return (c ^ 0xffffffff) >>> 0;
}

const table = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  table[i] = c >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(8 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, 8 + len);
  const crc = crc32(typeAndData);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

fs.writeFileSync('public/icon-192.png', createPng(192, 192, 15, 23, 42));
fs.writeFileSync('public/icon-512.png', createPng(512, 512, 15, 23, 42));
fs.writeFileSync('public/icon-maskable-192.png', createPng(192, 192, 15, 23, 42));
fs.writeFileSync('public/icon-maskable-512.png', createPng(512, 512, 15, 23, 42));
console.log('PNG icons generated successfully');
