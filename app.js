const express = require('express');
const app = express();
const HTMLParser = require('node-html-parser');
const fs = require('fs');
const {Storage} = require('@google-cloud/storage');
require('dotenv').config();

const port = process.env.Port;
const filename = `${process.env.FolderName}/${process.env.FileName}`;

const storage = new Storage({
    keyFilename: 'fileupload-62e6b-firebase-adminsdk-33nsw-84a838db74.json',
 });
 const bucketName = 'gs://fileupload-62e6b.appspot.com';

app.get('/', (req, res) => {
    let txt = fs.readFileSync(`${process.env.FolderName}/${process.env.RawHtmlFile}`).toString();
    // let txt = '<body><a class="a-class"></a><div class="demo" id="hi">fe</div><div class="demo2" id="h2">fe2</div><p></p><p><span></span></p><p></p><p></p><div></div><p>87</p></body>';
    res.send(parseHtmlString(txt));
});

function parseHtmlString(txt){
    const root = HTMLParser.parse(txt);
    let i = 0;
    while(i == 0){
        root.querySelectorAll('body').forEach((item) => {
            if(item.lastChild.innerHTML == "" && item.lastChild.rawTagName == "p"){
                item.removeChild(item.lastChild);
            } else {
                i = 1;
            }
        });
    }
    removeDivClasses(root);
    removeAnchClasses(root);
    removeImgClasses(root);
    removePClasses(root);
    saveModifiedHtml(root.querySelector('body').toString());
    return root.querySelector('body').outerHTML;
}
function removeDivClasses(root){
    root.querySelectorAll('div').forEach((item) => {
        item.removeAttribute('class');
    });
}
function removeAnchClasses(root){
    root.querySelectorAll('a').forEach((item) => {
        item.removeAttribute('class');
    });
}
function removeImgClasses(root){
    root.querySelectorAll('img').forEach((item) => {
        item.removeAttribute('class');
    });
}
function removePClasses(root){
    root.querySelectorAll('p').forEach((item) => {
        item.removeAttribute('class');
    });
}
function saveModifiedHtml(html){
    fs.writeFileSync(filename,html);
    uploadFile();
}
const uploadFile = async() => {

    // Uploads a local file to the bucket
    await storage.bucket(bucketName).upload(filename, {
        // Support for HTTP requests made with `Accept-Encoding: gzip`
        gzip: true,
        // By setting the option `destination`, you can change the name of the
        // object you are uploading to a bucket.
        metadata: {
            // Enable long-lived HTTP caching headers
            // Use only if the contents of the file will never change
            // (If the contents will change, use cacheControl: 'no-cache')
            cacheControl: 'public, max-age=31536000',
        },
});

console.log(`${filename} uploaded to ${bucketName}.`);
}

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`)
  });