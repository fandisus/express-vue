//script ini untuk bikin image input. Begitu pilih gambar, gambar tampil di form, tapi belum upload
$(document).ready(function() {
  var gaya = document.createElement('style');
  gaya.innerHTML =  ".file-input {position:relative; overflow:hidden;}";
  gaya.innerHTML += ".file-input input[type='file'] {position:absolute;top:0;left:0;display:block;width:100%;height:100%;opacity:0;}";
  gaya.innerHTML += ".file-input img {display:block;width:auto;height:auto;}";
  document.head.appendChild(gaya);

  $(".img-input").each(function() {
    var imgEl = $(this).children("img");
    var inputEl = $(this).children('input');
    inputEl.change(function() {
      var input = this;
      if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
          imgEl.attr('src',e.target.result);
        };
        reader.readAsDataURL(input.files[0]);
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
