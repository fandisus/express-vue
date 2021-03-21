//script ini untuk bikin image input. Begitu pilih gambar, gambar tampil di form, tapi belum upload
$(document).ready(function() {
  var gaya = document.createElement('style');
  gaya.innerHTML =  ".file-input {position:relative; overflow:hidden;}";
  gaya.innerHTML += ".file-input input[type='file'] {position:absolute;top:0;left:0;display:block;opacity:0;}";
  gaya.innerHTML += ".file-input img {display:block;width:auto;height:auto;}";
  document.head.appendChild(gaya);

  $(".file-input").each(function() {
    var imgEl = $(this).children("img");
    var inputEl = $(this).children('input');
    //=0 even when window.load
//    inputEl.height(imgEl.height());
//    inputEl.width(imgEl.width());
    inputEl.height($(this).attr('height'));
    inputEl.width($(this).attr('width'));
    imgEl.height($(this).attr('height'));
    imgEl.width($(this).attr('width'));

    var paragraph = $('<p>No file selected</p>');
    $(this).append(paragraph);
    inputEl.change(function() {
      var input = this;
      if (input.files && input.files[0]) {
        var names = Array.from(input.files, f=>f.name).join('<br />');
        paragraph.text(names);
      }
    });
  });
});
//Sample usage:
//<form id='picform' enctype="multipart/form-data">
//  <label for="profile_pic">Profile pic</label>
//  <div class='file-input'>
//    <img ng-src='{{biodata.img_profile}}'/>
//    <input type="file" name='profile_pic'/>
//  </div>
//  <button ng-click="changePP()" class="btn btn-success"><i class="fa fa-upload"></i> Simpan</button>
//  <button ng-click='nullPP()' class='btn btn-default'>Pakai PP FB</button>
//</form>
