var app;
$(document).ready(()=>{
  var uri='/login';
  app = new Vue({
    el:'#app',
    data: {username:'',password:''},
    methods: {
      tryLogin: function() {
        tr.post(uri, {username:this.username, password:this.password}, rep=>{
          swal.fire('Login success','Login successful. You will be directed to member\'s page','success')
          .then(result=>{ location='/user'; }); 
        });
      }
    }
  });
});
