# TED System Uploader
Simple uploader for TED System

## Description
This application will automatically zip `.json`, `.xml` files and upload this zip file to `TED/System/Upload`.

You don't have to **delete** the zip file after uploaded. This application will ignore all the files except `.json` and `.xml`.

**Output:** `output.zip`

**Note:** I add a lot of `console.log` and `delay` for more visualizer.
You can delete it if you don't need it.

## How to use it
### TED-Uploader.Exe
1. Modify path in `config.json` set to your template folder. E.g. `C://TED/ModuleData/MOE/`
2. Click `TED-Uploader` and wait for uploading.
3. Done!

### Local-Uploader.exe
1. Put your `Local-Uploader.exe` to your template folder.E.g. `C://TED/ModuleData/MOE/Local-Uploader.exe`
2. Click `Local-Uploader.exe` and wait for uploading.
3. Done!

### Nodejs
1. Clone this repo
2. Run `npm install`
3. Modify `config.json`
4. Type `node update.js` in terminal to start

## License
[MIT](https://github.com/benny123tw/TED-Uploader/blob/master/LICENSE)
