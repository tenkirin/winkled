/**
 * References:
 * - https://learn.microsoft.com/en-us/windows-hardware/drivers/hid/keyboard-and-mouse-class-drivers#scan-code-mapper-for-keyboards
 * - https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_code_values#code_values_on_windows
 * - https://kbdlayout.info/kbdus/scancodes+names?arrangement=ANSI104
 */

import { argv, exit } from 'node:process';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { toDWORD } from './utils/binary.js';

import FORMAT from './consts/format.json' with { type: 'json' }; // https://nodejs.org/api/esm.html#json-modules
import SCANCODE from './consts/scancode.js';

// https://nodejs.org/api/url.html#urlfileurltopathurl-options
// https://nodejs.org/api/esm.html#importmetaurl
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);  // https://nodejs.org/api/path.html#pathdirnamepath
const dstDir = resolve(__dirname, '../dist'); // https://nodejs.org/api/path.html#pathresolvepaths
const [, , format = FORMAT.batch, configFile = 'remappings.winkled.json'] = argv; // https://nodejs.org/api/process.html#processargv
const configFilePath = resolve(__dirname, `../${configFile}`);

const createRecoverFile = async () => {
  const f = resolve(dstDir, `recover.winkled.${format}`);
  const content = format === FORMAT.batch
    ? String.raw`@echo off
reg delete "hklm\system\currentcontrolset\control\keyboard layout" /v "ScanCode Map" /f
echo "Keyboard Layout Recovered. It will take effect after rebooting the system."
pause`
    : String.raw`Windows Registry Editor Version 5.00
[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Keyboard Layout]
"ScanCode Map"=hex:00,00,00,00,00,00,00,00,01,00,00,00,00,00,00,00`;

  try {
    console.log('Remapping config file not found. Generate recover file.');
    // https://nodejs.org/api/fs.html#fspromiseswritefilefile-data-options
    // https://nodejs.org/api/fs.html#file-system-flags
    await writeFile(f, content, { encoding: 'utf-8', flag: 'w' });
    console.log('Recover file generated.');
  } catch (err) {
    console.error(err);
    console.log('Cannot generate recover file.');
  }
};

const createRemapFile = async remappings => {
  const f = resolve(dstDir, `remap.winkled.${format}`);
  const scancodeMap = toScancodeMap(remappings);
  const content = format === FORMAT.batch
    ? String.raw`@echo off
reg add "hklm\system\currentcontrolset\control\keyboard layout" /v "ScanCode Map" /t REG_BINARY /d "${scancodeMap}" /f
echo "Keyboard Layout Remapped. It will take effect after rebooting the system."
pause`
    : String.raw`Windows Registry Editor Version 5.00
[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Keyboard Layout]
"ScanCode Map"=hex:${scancodeMap}`;

  // console.debug(remappings);
  // console.debug(scancodeMap);
  // console.debug(content);

  try {
    console.log('Remapping config file found. Generate remap file.');
    await writeFile(f, content, { encoding: 'utf-8', flag: 'w' });
    console.log('Remap file generated.');
  } catch (err) {
    console.error(err);
    console.log('Cannot generate remap file.');
  }
};

/**
 * > The first and second DWORDS store header information and should be set to all zeroes for the current version of the Scan Code Mapper.
 * > The third DWORD entry holds a count of the total number of mappings that follow, including the null terminating mapping.
 * > The minimum count would therefore be 1 (no mappings specified).
 * > The individual mappings follow the header.
 * > Each mapping is one DWORD in length and is divided into two WORD length fields.
 * > Each WORD field stores the scan code for a key to be mapped.
 * See also https://learn.microsoft.com/en-us/windows-hardware/drivers/hid/keyboard-and-mouse-class-drivers#example-1
 */
const toScancodeMap = remappings => {
  // Convert key remappings to numeral representation of DWORD
  const remapNumbers = Object.entries(remappings)
    .map(([from, to]) => [SCANCODE[from] ?? 0, SCANCODE[to] ?? 0])
    .map(([from, to]) => (from << 4 * 4) + to);
  // Convert all numbers to DWORD arrays, which are byte arrays of 32-bit unsigned integer
  return [
    0,                            // Header: Version Information
    0,                            // Header: Flags
    remapNumbers.length + 1,      // Header: Number of Mappings
    ...remapNumbers,              // Individual Mappings
    0                             // Null Terminator
  ].map(toDWORD).flat(Infinity).join(format === FORMAT.batch ? '' : ',');
};

// Start from here
(async () => {
  // Check format
  if (!Object.values(FORMAT).includes(format)) {
    console.error(`Unsupported format: ${format}. Only bat and reg are valid.`);
    exit(1);
  }

  // Create dist dir
  try {
    await mkdir(dstDir, { recursive: true }); // https://nodejs.org/api/fs.html#fspromisesmkdirpath-options
  } catch (err) {
    console.error(err);
    console.error('Cannot create dist directory.');
    exit(1);
  }

  // Create file
  try {
    // https://nodejs.org/api/esm.html#import-expressions
    // https://nodejs.org/api/esm.html#import-attributes
    const { default: remappings } = await import(configFilePath, { with: { type: 'json' } });
    await createRemapFile(remappings);
  } catch (err) {
    if (err.code !== 'ERR_MODULE_NOT_FOUND') {  // https://nodejs.org/api/errors.html#errorcode
      console.error(err);
      exit(1);
    }

    // No remappings
    await createRecoverFile();
  }
})();
