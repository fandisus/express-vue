import Vue from 'vue';
import profiles from './../js/user-management/profiles.js';

$(document).ready(()=> {
  // import profiles from './user-management/profiles.js';
  var uri='/user/user-management';

  window.app = new Vue({
    el:'#app',
    components:{profiles},
    data:{
      modUser:{
        id:0, name:'', username:'', pass:'', cpass:'',
        department:'', role:'', aclProfile:'', email:'', phone:''
      },
      modPassword:{pass:'',cpass:'',target:{username:''}},
      users:[], departments:[], roles:[],
      aclProfiles:[], menuOptions:[]
    },
    mounted:function() { this.init(); },
    methods:{
      init:function() {
        tr.post(uri,{a:'init'}, rep=>{
          this.users = rep.users;
          this.aclProfiles = rep.aclProfiles;
          this.menuOptions = rep.menuOptions;
          this.departments = rep.departments;
          this.roles = rep.roles;
        });
      },
      ACLProfileUpdated:function(obj) {
        this.aclProfiles = obj.acls;
        this.menuOptions = obj.menus;
      },
      getUsers:function() {
        tr.post(uri,{a:'getUsers'}, rep=>{ this.users = rep.users; });
      },
      showModUser:function(u) {
        if (u.username === undefined) {
          this.modUser = {
            id:0, name:'', username:'', pass:'', cpass:'',
            department:'', role:'', aclProfile:'', email:'', phone:''
          };
        } else {
          this.modUser = {
            id:u.id,
            name:u.name,
            username:u.username,
            department: u.department,
            role: u.role,
            email: u.email, phone: u.phone,
            aclProfile:u._aclProfile.name,
            pass:'', cpass:''
          };
        }
        $('#modUser').modal('show');
      },
      saveUser:function() {
        tr.post(uri, {a:'saveUser', u:JSON.stringify(this.modUser)}, rep=> {
          if (this.modUser.id === 0) {
            this.users.push (rep.u);
            $.notify('User added', { position:'top center', className:'success'});
          } else {
            let u = this.users.find(r => r.id === rep.u.id);
            console.log(u)
            _.assign(u, rep.u);
            $.notify('User updated', { position:'top center', className:'success'});
          }
          $('#modUser').modal('hide');
        });
      },
      showCPass:function(u) {
        this.modPassword = { target: u, pass:'', cpass:'' };
        $('#modCPass').modal('show');
      },
      changePass:function() {
        tr.post(uri,{a:'changePass', u:this.modPassword.target.id, pass:this.modPassword.pass}, rep=>{
          $.notify('Password changed', { position:'top center', className:'success'});
          $('#modCPass').modal('hide');
        });
      },
      delUser:function(u) {
        Swal.fire({
          title: 'Are you sure?',
          text: `Confirm to delete User: ${u.username}?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
          if (result.value) {
            tr.post(uri, {a:'delUser', target:u.id}, rep=> {
              Swal.fire('Deleted!', `User ${u.username} has been deleted.`, 'success');
              this.users.splice(this.users.indexOf(u), 1);
            });
          }
        });
      },
    }
  });
  
  $('#tabs .button').tab();
});
