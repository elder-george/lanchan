import express from 'express';
import path from 'node:path';
import pathPosix from 'node:path/posix';
import fs from 'node:fs';
import { fileURLToPath, } from 'node:url';
import http from 'http';
import multer from 'multer';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = http.createServer(app);
const targetDir = 'uploaded-files/';

const listener = server.listen(process.env.PORT || 3000);
app.use(express.static(dirname + '/..'))
    .use('/uploaded-files', express.static(targetDir))
    .post('/upload', multer({ dest: targetDir }).single('file'), function (request, response, next) {
        const file = request.file;
        console.log(file);
        const extension = path.extname(file.originalname);
        const filename = file.filename;
        const targetFileName = [extension, 'jpg'].includes(path.extname(filename))
            ? filename
            : filename + extension;
        const targetPath = pathPosix.join(targetDir, targetFileName);
        fs.copyFileSync(file.path, targetPath);
        console.log("http://localhost:" + listener.address().port + '/' + targetPath);
        response.send({ path: targetPath, success: true });
        next();
    }).delete('/upload/:filename', function (request, response, next) {
        console.log('deleting ' + request.path);
        try {
            const filePath = pathPosix.join(targetDir, request.params.filename);
            fs.unlinkSync(filePath);
            console.log('deleted!');
            response.send({ success: true });
        } catch (e) {
            console.log("couldn't delete: " + e);
            response.send({ success: false });
        }
        next();
    });