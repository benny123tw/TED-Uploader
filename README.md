# TED System Uploader
Simple uploader for TED System

## Description
This application will automatically zip `.json`, `.xml` files and upload this zip file to `TED/System/Upload`.

You don't have to **delete** the zip file after uploaded. This application will ignore all the files except `.json` and `.xml`.

**Output:** `output.zip`

****

## How to use it
### Exe
1. Put `TED-Uploader` to project template folder. E.g. `/ModuleData/MOE/TED-Uploader`
2. Click `TED-Uploader` and wait for uploading
3. Done.

### Nodejs
1. Clone this repo
2. Run `npm install`
3. Modify `update.js` config
4. Type `node update.js` in terminal to start

## License
[MIT](https://github.com/benny123tw/TED-Uploader/blob/master/LICENSE)
