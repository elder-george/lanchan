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
            var url = window.location.protocol + "//" + window.location.host + e.path;
            permalink.attr('href', url);
            permalink.text(url);
            if (window.localStorage){
                window.localStorage.setItem(new Date(), JSON.stringify({ url:url}));
                populateHistory($history, window.localStorage);
            }
        }
  });
}

function deleteFile(url, onSuccess){
    $.ajax({
        type: "DELETE",
        url: "/upload/"+url,
        success: onSuccess
    });
}

function populateHistory(history, items){
    history.empty();
    for(var key in items){
        var data = JSON.parse(items[key]);
        if (! data) continue;
        var fileName = data.url.split('/').pop();
        var $historyItem = $('<li/>')
            .append([
                $('<a/>').text(moment(key).format("MM DD, hh:mm:ss")).attr('href', data.url),
                $('<a/>').attr('class', 'del').attr('url', fileName).attr('title', 'delete this file?').text('[X]')
            ]);
        $historyItem.prependTo($history);

        $historyItem.find('a.del').on('click', function(e){
            var $this = $(this);
            var url = $this.attr('url');
            deleteFile(url, function(){
                $this.closest('li').remove();
                if (window.localStorage){
                    window.localStorage.removeItem(key);
                }
            })
        });
    }
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


var $data, $size, $type, $test, $width, $height, $history;
$(function() {
  $data = $('.data');
  $size = $('.size');
  $type = $('.type');
  $test = $('#test');
  $width = $('#width');
  $height = $('#height');
  $history = $("#history");
  if (window.localStorage)
    populateHistory($history, window.localStorage)
})
})($);