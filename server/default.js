var express = require('express'),
    app     = express(),
    fs      = require('fs-extra'),
    server  = require('http').createServer(app),
    $multipart = require('connect-multiparty');

app.use(express.static(__dirname + '/..'));
app.use('/uploaded-files', express.static(__dirname + '/uploaded-files'));
var listener = server.listen(process.env.PORT || 3000);

app.post('/upload', $multipart(), function(request, response, next) {
    //console.log(request.files);
    var file = request.files.file;
        console.log(file);
        var pathParts = file.path.split(/[\/\\]/);
        var extension = "."+file.type.split(/\//)[1];
        var filename = pathParts[pathParts.length - 1];
        var targetPath = "/uploaded-files/"+filename;
        if (!filename.match(extension+"$")){
            targetPath = targetPath+extension;
        }
        fs.copySync(file.path, __dirname+targetPath);
        console.log("http://localhost:" + listener.address().port+targetPath);
    response.send({ path: targetPath, success: true });
});