var tr = function() {};
//Calon tambahan: notifbar: http://red-team-design.com/cool-notification-messages-with-css3-jquery/
$(document).ready(function() {
  var gaya = document.createElement('style');
  gaya.innerHTML =  "#loadScreen {position:fixed;top:0;left:0; background-color:rgba(255,255,255,.7); display:none;width:100%;height:100%; text-align:center;vertical-align:middle;z-index:1100;}";
  gaya.innerHTML += "#loadScreen div {margin:auto;margin-top:150px;}";
  gaya.innerHTML += "#loadScreen progress {width:80%; max-width:500px;}";
  document.head.appendChild(gaya);
  //http://stackoverflow.com/questions/3097644/can-code-in-a-javascript-file-know-its-own-domain-url
  var path = $('script[src$="myloading.js"]').attr('src');
  var mydir= path.split('/').slice(0, -1).join('/')+'/';  // remove last filename part of path
  $("body").append("<div id='loadScreen'><div><img src='"+mydir+"loading.gif'/></div><progress value='100' max='100'></progress></div>");
});
tr.loading = function(Show) {
  if (Show) $("#loadScreen").fadeIn();
  else $("#loadScreen").fadeOut();
};
tr.handleResponse = function(reply,successcb,errorcb) {
  try {
    if (reply.result === "error") {
      if(typeof errorcb === 'function') errorcb(reply);
      else $('body').toast({title:'Error',message:reply.message, class:"error"});
    }
    else if (reply.result === "success") { successcb(reply); }
    else if (reply.result === "debug") { console.log(reply.data); }
  } catch (e) {
    console.log(reply);
    console.log(e);
    $('body').toast({title:'Error',message:'Unknown Error. Check console log (F12) for details', class:"error"});
  }
};
tr.post = function(uri,oPost, successcb,errorcb) {
  tr.loading(true);
  $.post(uri, oPost, function(reply,stat,xhr) {
//    console.log(xhr.getResponseHeader('content-type'));
    tr.handleResponse(reply,successcb,errorcb);
  },'json')
  .always(function() { tr.loading(false); })
  .fail(function(r) { console.log(r.responseText); });
};
tr.silentPost = function(uri,oPost, successcb,errorcb) {
  $.post(uri, oPost, function(reply) {
    tr.handleResponse(reply,successcb,errorcb);
  },'json')
  .fail(function(r) { console.log(r.responseText); });
};

//modifikasi dari http://stackoverflow.com/questions/166221/how-can-i-upload-files-asynchronously-with-jquery
tr.postForm = function(uri,form,successcb,errorcb) { //Form is a DOM object e.g: $("#formLoadFCA")[0]
  tr.postFormData(uri, new FormData(form), successcb,errorcb);
};
tr.postFormFromObj = function(uri, obj, successcb, errorcb) {
  var formData = new FormData();
  for (var i in obj) formData.append(i, obj[i]);
  tr.postFormData(uri, formData, successcb, errorcb);
};
//formData is formData: use: formData = new FormData();  formData.append(key,val);
//Untuk ambil data gambar: formData.append('gambar', $('#fileInput')[0].files[0]))
tr.postFormData = function(uri,formData,successcb,errorcb) {
  tr.loading(true);
  $.ajax({
    dataType:'json',
    url:uri, type:'POST',data:formData,contentType:'multipart/form-data',
    error: function(j, stat, error) { console.log(j); console.log(stat); console.log(error); },
    success: function(reply) {
      tr.handleResponse(reply,successcb,errorcb);
    },
    xhr: function() {  // Custom XMLHttpRequest
      var myXhr = $.ajaxSettings.xhr();
      if(myXhr.upload){ // Check if upload property exists
          myXhr.upload.addEventListener('progress',showProgress, false);
          // For handling the progress of the upload. loadingcb is a function(e). See example below
      }
      return myXhr;
    },
    cache:false, contentType:false, processData:false
  })
  .always(function() { tr.loading(false); })
  .fail(function(r) { console.log(r.responseText); });
};


var showProgress = function(e) {
  if (e.lengthComputable){
    $("#loadScreen progress").attr("value",parseInt(e.loaded/e.total * 100));
  }
};
//var loadingcbExample = function(e) {
//  if(e.lengthComputable){
//    $scope.uploadPercentage = parseInt(e.loaded/e.total * 100);
//    $scope.$apply();
//  };
//};

