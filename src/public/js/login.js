var uri='/login';
export default {
  name: 'app',
  data: function() { return {
    username:'',password:''
  }},
  methods: {
    tryLogin: function() {
      tr.post(uri, {username:this.username, password:this.password}, rep=>{
        $('body').toast({
          title:'Login success', message:'Login successful. You will be directed to member\'s page', class:'success',
          showProgress:'bottom', onHide:()=>{ location='/user'; }
        });
      });
    }
  }
}