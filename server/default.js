import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import http from 'http';
import multer from 'multer';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = http.createServer(app);
const targetDir = dirname + '/uploaded-files/';

const listener = server.listen(process.env.PORT || 3000);
app.use(express.static(dirname + '/..'))
    .use('/uploaded-files', express.static(targetDir))
    .post('/upload', multer({ dest: targetDir }).single('file'), function (request, response) {
        const file = request.file;
        console.log(file);
        const extension = "." + file.mimetype.split(/\//)[1];
        const filename = file.filename;
        const targetPath = "/uploaded-files/" + filename;
        if (!(filename.match(extension + "$") || filename.match(".jpg$"))) {
            targetPath = targetPath + extension;
        }
        fs.copyFileSync(file.path, dirname + targetPath);
        console.log("http://localhost:" + listener.address().port + targetPath);
        response.send({ path: targetPath, success: true });
    }).delete('/upload/:url', function (request, response) {
        console.log('deleting ' + request.url);
        try {
            let path = targetDir + request.url.split('/').pop();
            path = path.replace(/\*\?\+/, '');
            fs.unlinkSync(path);
            console.log('deleted!');
            response.send({ success: true });
        } catch (e) {
            console.log("couldn't delete: " + e);
            response.send({ success: false });
        }
    });