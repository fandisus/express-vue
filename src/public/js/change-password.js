import Vue from 'vue';

$(document).ready(()=> {
  let uri='/user/change-password';

  let app = new Vue({
    el:'#app',
    data: {oldpass:'',pass:'',cpass:''},
    methods: {
      changePassword:function() {
        tr.post(uri, {a:'changePassword', oldpass:this.oldpass, pass:this.pass, cpass:this.cpass}, rep=>{
          $.notify('Password successfully changed', {className:'success'});
          this.oldpass = '';
          this.pass = '';
          this.cpass = '';
          $('.ui.form input')[0].focus();
        });
      }
    }
  });
});
