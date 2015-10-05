var express = require('express'),
    app     = express(),
    fs      = require('fs-extra'),
    server  = require('http').createServer(app),
    $multipart = require('connect-multiparty');

app.use(express.static(__dirname + '/..'));
app.use('/uploaded-files', express.static(__dirname + '/uploaded-files'));
server.listen(process.env.PORT || 3000);

app.post('/upload', $multipart(), function(request, response, next) {
    console.log(request.files);
    var file = request.files.file;
        console.log(file);
        var pathParts = file.path.split(/[\/\\]/);
        var extension = file.type.split(/\//)[1];
        var targetPath = "/uploaded-files/"+pathParts[pathParts.length - 1]+"."+extension;
        console.log(targetPath);
        fs.copySync(file.path, __dirname+targetPath);
    response.send({ path: targetPath, success: true });
});