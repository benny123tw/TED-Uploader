const fs = require("fs");
const JSZip = require("jszip");
const FormData = require("form-data");
const http = require("http");
const config = { dir: "./" };
const allow = ["json", "xml"];
const chalk = require("chalk");
const subFolder = [];

const zip = new JSZip();
const root = fs.readdirSync(`${config.dir}`);

// get file with encding
const getFileContent = (fileName, folderName) => fs.readFileSync(getFullFileName(fileName, folderName), {encoding: "utf-8",});
// get file path
const getFullFileName = (fileName, folderName = '') => `${config.dir}${folderName}/${fileName}`;
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

var zipLength = 0;
console.log(`${chalk.greenBright('Zip files:')}`);

for (let fileName of root) {
    // split file to get file type
    const fsplit = fileName.split('.');
    // if fsplit length = 1, this file probably is the folder
    if (fsplit.length < 2 ) {
        // get subfolder name
        subFolder.push(fileName);
        continue;
    }
    // skip invalid file type
    if (!allow.includes(fsplit[fsplit.length-1])) continue;

    // get file
    const file = getFileContent(fileName);
    // add to zip
    zip.file(fileName, file);
    console.log(`${zipLength++}. ${fileName}`);
}

subFolder.forEach(folderName => {
    // get files from subfolder
    const sub = fs.readdirSync(`./${config.dir}${folderName}`);
    for (let fileName of sub) {
        const fsplit = fileName.split('.');
        if (fsplit.length < 2 ) {
            subFolder.push(fileName)
            continue;
        }
        if (!allow.includes(fsplit[fsplit.length-1])) continue;
    
        const file = getFileContent(fileName, folderName);
        zip.file(`${folderName}/${fileName}`, file);
        console.log(`${zipLength++}. ${fileName}`);
    }
});

var zipLength = 1;
zip.forEach((path, file) => {if(!file.dir) zipLength++});

// zipper
zip.generateAsync({
    // nodeJs not support blob type
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: {
        level: 9
    }
}).then(async content => {    
    console.log(`${chalk.greenBright('Total:')} ${zipLength} files`)
    for (let i=0; i<10; i++) {
        process.stdout.write('===');
        await delay(100);
    }
    process.stdout.write('\n');
    let newZip = 'output.zip';
    // write to path
    fs.writeFile('./' + newZip , content,  (err) => {
        if (!err) return console.log(`${chalk.greenBright('Result:')} ${newZip} >> ${chalk.yellowBright('Completed!')}`);
        console.log(`${chalk.greenBright('Result:')} ${newZip} >> ${chalk.redBright('Failed!')}`);
    });

    //create form-data
    const formData = new FormData();

    // body{ id: file, value: output.zip }
    formData.append("file", fs.createReadStream('./output.zip'));    

    // using http sendding request
    const request = http.request({
        method: 'post',
        host: 'localhost',
        path: 'http://localhost/TED/System/Upload',
        headers: formData.getHeaders(),
        params: {id: "FormUpload"} // url will become => http://localhost/TED/System/Upload?id=FormUpload
    });

    // submit form data
    formData.pipe(request); 

    // set response event
    request.on('response', async (res) => {
        console.log(`Status Code: ${chalk.greenBright(res.statusCode)} ${chalk.greenBright(res.statusMessage)}`);
        console.log(`${chalk.yellowBright(`Upload Completed!`)}`);
        let body = '';
        res.on('data', function (chunk) {
            body += chunk;
        });
        res.on('end', function () {
            console.log('Server Response: ' + chalk.yellowBright(body));
        });
        await delay(2000);
    });
});
