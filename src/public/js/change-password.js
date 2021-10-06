var uri='/user/change-password';
export default {
  name:'#app',
  data: function() { return {
    oldpass:'',pass:'',cpass:''
  }},
  methods: {
    changePassword:function() {
      tr.post(uri, {a:'changePassword', oldpass:this.oldpass, pass:this.pass, cpass:this.cpass}, rep=>{
        $('body').toast({title:'Success', message:'Password successfully changed', class:'success'});
        this.oldpass = '';
        this.pass = '';
        this.cpass = '';
        $('.ui.form input')[0].focus();
      });
    }
  }
}