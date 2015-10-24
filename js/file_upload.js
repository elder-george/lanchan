(function($){

function uploadFile(results){
  var fd = new FormData();
  fd.append("file", results.file);
  $.ajax({
        type: "POST",
        url:"/upload",
        data: fd,
        processData: false,
        contentType:false,
        success: function(e){ 
            var permalink = $("#permalink");
            permalink.attr('href', window.location.protocol + "//" + window.location.host + e.path);
            permalink.text(window.location.protocol + "//" + window.location.host + e.path);
        }
  });
}



$("html").pasteImageReader(function(results) {
  var dataURL, filename;
  filename = results.filename, dataURL = results.dataURL;
  $data.text(dataURL);
  $size.val(results.file.size);
  $type.val(results.file.type);
  $test.attr('href', dataURL);
  var img = document.createElement('img');
  img.src= dataURL;
  var w = img.width;
  var h = img.height;
  $width.val(w)
  $height.val(h);
  uploadFile(results);
  return $(".active").css({
    backgroundImage: "url(" + dataURL + ")"
  }).data({'width':w, 'height':h});
});

$('html').fileDrop({
    dragOver: function(e){
        debugger;
    },
    onFileRead: function(e){
        results = e[0];
       uploadFile(results);
      var img = document.createElement('img');
      img.src= results.dataURL;
      var w = img.width;
      var h = img.height;
       return $(".target").css({
                    backgroundImage: "url(" + results.dataURL + ")",
                    width:w, height:h,
                  }).data({'width':w, 'height':h});
    },

    removeDataUriScheme: true,
    decodeBase64: true
});


var $data, $size, $type, $test, $width, $height;
$(function() {
  $data = $('.data');
  $size = $('.size');
  $type = $('.type');
  $test = $('#test');
  $width = $('#width');
  $height = $('#height');
})
})($);