export const toDWORD = num => toBinary(num, { type: 'Uint32', littleEndian: true });

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Typed_arrays#dataview
export const toBinary = (
  x,
  { type = 'Float64', littleEndian = false, radix = 16, toStr = false, separator = ' ', } = {},
) => {
  const bytesNeeded = globalThis[`${type}Array`].BYTES_PER_ELEMENT; // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/BYTES_PER_ELEMENT
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer
  const dv = new DataView(new ArrayBuffer(bytesNeeded));
  dv[`set${type}`](0, x, littleEndian); // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/setInt8
  const bytes = Array.from( // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from
    { length: bytesNeeded },
    (_, i) => dv
      .getUint8(i)  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView/getUint8
      .toString(radix)
      .padStart(8 / Math.log2(radix), "0"),
  );
  return toStr ? bytes.join(separator) : bytes;
};
