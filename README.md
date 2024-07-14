# winkled

The **WIN**dows **K**eyboard **L**ayout **ED**itor

## Requirements

- Node >= 20

## Usage

Clone this repo and change directory to it.

```PowerShell
git clone https://github.com/tenkirin/winkled.git; cd winkled
```

### Remapping

> [!NOTE]
> Refer to the [MDN docs](https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_code_values#code_values_on_windows) or [this file](./src/consts/scancode.js) for the complete list of key names.

1. Create a configuration file named `remappings.winkled.json` containing key remapping rules in the format `"FROM_KEY": "TO_KEY"` under the root directory of the project.

    Example: Swap `CapsLock` key with `ControlLeft` key

    ```JSON
    {
      "CapsLock": "ControlLeft",
      "ControlLeft": "CapsLock"
    }
    ```

1. Run npm scripts

   - To generate a [batch (`.bat`) file](https://en.wikipedia.org/wiki/Batch_file), run

       ```PowerShell
       npm run bat
       ```

   - To generete a [Registration entries (`.reg`) file](https://en.wikipedia.org/wiki/Windows_Registry#.REG_files), run

       ```PowerShell
       npm run reg
       ```

1. Execute the generated file `remap.winkled.*`  in `./dist` directory and reboot the computer.

### Recover

To remove all remappings and recover to the system default:

1. Delete the configuration file `remappings.winkled.json`.

1. Run npm scripts as mentioned above.

1. Execute the generated file `recover.winkled.*` in `./dist` directory and reboot the computer.

## License

[MIT License](https://opensource.org/licenses/MIT)
