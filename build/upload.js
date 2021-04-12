const fs = require("fs");
const JSZip = require("jszip");
const FormData = require("form-data");
const http = require("http");
const chalk = require("chalk");

// get file with encding
const getFileContent = (fileName, path = './') => fs.readFileSync(getFullFileName(fileName, path), {encoding: "utf-8",});
// get file path
const getFullFileName = (fileName, path = './') => `${path}/${fileName}`;
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Read files from dir and zip it to the server
 * @param {Object} config
 * @param {String} config.dir
 * @param {Array} config.allow 
 * @param {String} config.method
 * @param {String} config.host
 * @param {String} config.path
 * @param {Object} config.params
 * @returns 
 */
const uploader = (config = {}) => {
    const {
        dir = './',
        allow = [],
        method = 'post',
        host = 'localhost',
        path = 'localhost/',
        params = {},
    } = config;
    const zip = new JSZip();
    var zipLength = 0;
    console.log(`${chalk.greenBright('Zip files:')}`);

    if (!fs.existsSync(dir)) return console.error('Please provide valid path!');
    const root = fs.readdirSync(dir);

    function traverseFileTree(folderName, path = './') {
        // get files from subfolder
        const sub = fs.readdirSync(`${path}${folderName}`);
        for (let fileName of sub) {
            const fsplit = fileName.split('.');
            if (fsplit.length < 2 ) {
                // skip not directory
                if (!fs.lstatSync(`${path}${folderName}/${fileName}`).isDirectory()) continue;
                traverseFileTree(fileName, `${path}${folderName}/`);
                continue;
            }
            if (!allow.includes(fsplit[fsplit.length-1])) continue;
        
            const file = getFileContent(fileName, `${path}${folderName}`);
            zip.file(`${folderName}/${fileName}`, file);
            console.log(`${++zipLength}. ${folderName}/${fileName}`);
        }
    }

    for (let fileName of root) {
        // split file to get file type
        const fsplit = fileName.split('.');
        // if fsplit length = 1, this file probably is the folder
        if (fsplit.length < 2 ) {
            // skip not directory
            if (!fs.lstatSync(`${dir}${fileName}`).isDirectory()) continue;
            // get subfolder name
            traverseFileTree(fileName, dir);
            continue;
        }
        // skip invalid file type
        if (!allow.includes(fsplit[fsplit.length-1])) continue;
    
        // get file
        const file = getFileContent(fileName, dir);
        // add to zip
        zip.file(fileName, file);
        console.log(`${++zipLength}. ${fileName}`);
    }

    zipper(zip, 
        zipLength, {
        method: method,
        host: host,
        path: path,
        params: params
    });
}

/**
 * Zip file and send request to server
 * @param {Object} zip - JSZip Object
 * @param {Number} zipLength - Zip files length
 * @param {Object} options - Request options
 * @param {String} options.method - Request method
 * @param {String} options.host - Request host
 * @param {String} options.path - Request path
 * @param {Object} options.params - Request params
 */
const zipper = async (zip, zipLength, options = {}) => {
    if (!(zip instanceof JSZip)) console.error(`${chalk.bold.red('Type Error:')} This is not a JSZip`);
    const {
        method = 'post',
        host = 'localhost',
        path = 'localhost/',
        params = {},
    } = options;

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

        await delay(1000);

        //create form-data
        const formData = new FormData();

        // body{ id: file, value: output.zip }
        formData.append("file", fs.createReadStream('./output.zip'));    

        // using http sendding request
        const request = http.request({
            method: method,
            host: host,
            path: path,
            headers: formData.getHeaders(),
            params: params
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
            if (res.statusCode === 200)
                console.log('Server Response: ' + chalk.yellowBright(body));
        });
        await delay(2000);
        fs.unlinkSync('./' + newZip)
        });
    });
}

// Application config
const file = fs.readFileSync('./config.json', {encoding: "utf-8",});
const config = JSON.parse(file);
// if path is not end with '/' then add '/'
config.dir = !config.dir.endsWith('/') ? config.dir + '/' : config.dir;

// Application entry
uploader(config);