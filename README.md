# winkled

The **WIN**dows **K**eyboard **L**ayout **ED**itor

## Requirements

- Node >= 20

## Usage

1. Clone this repo and change directory to it.

    ```
    git clone https://github.com/tenkirin/winkled.git; cd winkled
    ```

1. Create a config file named `remappings.winkled.json` with key remapping rules under the root directory of the project.

    Example: Swap `CapsLock` key with `ControlLeft` key

    ```JSON
    {
      "CapsLock": "ControlLeft",
      "ControlLeft": "CapsLock"
    }
    ```

1. Run npm scripts

   - To generate a [batch (`.bat`) file](https://en.wikipedia.org/wiki/Batch_file), run

       ```
       npm run bat
       ```

   - To generete a [Registration entries (`.reg`) file](https://en.wikipedia.org/wiki/Windows_Registry#.REG_files), run

       ```
       npm run reg
       ```

1. Execute generated file in `./dist` directory and reboot the computer.

> [!NOTE]
> To remove all remappings and recover to the system default, delete the config file `remappings.winkled.json`, then re-run npm scripts.

## License

[MIT License](https://opensource.org/licenses/MIT)
