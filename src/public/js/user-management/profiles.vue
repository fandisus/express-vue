<template>
  <div>
    <!-- Add button -->
    <button class="ui mini green button" @click="showModal">
      <i class="plus icon"></i> Add ACL Profile
    </button>
    <button class="ui mini cyan button" @click="getACL">
      <i class="refresh icon"></i> Reload ACL Profile
    </button>

    <!-- ACL Profiles Table -->
    <table class="ui table very compact striped collapsing table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Menus</th>
          <th>Controls</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="acl in acls" v-bind:key="acl.name">
          <td>{{acl.name}}</td>
          <td v-html="showInLines(acl.menus)"></td>
          <td>
            <i class="blue pencil icon islink" title="Edit" @click="showModal(acl)"></i>
            <i class="red trash icon islink" title="Delete" @click="delAclProfile(acl)"></i>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- ACL Menu Modal -->
    <div class="ui small modal" id="modAclProfile">
      <div class="header">ACL Profile</div>
      <div class="content">
        <div class="ui form">
          <div class="inline field">
            <label>Name</label>
            <input type="text" v-model="modal.name" />
          </div>
          <h2>Menus</h2>
          <div id="modACLMenuChoices">
            <div v-for="(m, idx) in modal.menus" v-bind:key="idx">
              <div class="ui checkbox">
                <input @click.stop.prevent="checkMenu(m)" :indeterminate.prop="m.checked == null"
                  type="checkbox" v-model="m.checked" />
                <label>{{m.text}}</label>
              </div>
              <div class="subACL">
                <div class="ui checkbox" v-for="a in m.access" v-bind:key="a">
                  <input @click.stop.prevent="checkSubMenu(m, a)"
                    type="checkbox" v-model="m.selAccess" v-bind:value="a" />
                  <label>{{a}}</label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="actions">
        <button class="ui green button" @click="saveACLProfile">Save</button>
        <button class="ui negative button">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script>
let uri = '/user/user-management'
export default {
  props: ['acls', 'menus'],
  data:function() {
    return {
      modal:{name:''}
    }
  },
  methods: {
    showInLines:function(menus) {
      return menus.reduce((res, m) => res + `${m.text}<br />[${m.access.join(', ')}]<br />`, '');
    },
    showModal:function(acl) {
      if (acl.menus === undefined) { //If new
        let menus = this.menus.map(m=>{
          return {text:m.text, checked:true, access:_.clone(m.access), selAccess:_.clone(m.access)};
        });
        this.modal= {name:'', menus:menus, isNew:true};
      } else {
        let menus = this.menus.map(m=>{
          //Create result object first, change checked, selAccess later.
          let res = {text:m.text, checked:false, access:_.clone(m.access), selAccess:[]};
          //Find in acl the corresponding menu, and copy the access granted.
          let m2 = acl.menus.find(menu=>menu.text === m.text);
          if (m2 !== undefined) { 
            res.selAccess = _.clone(m2.access);
            if (res.access.length === res.selAccess.length) res.checked = true; else res.checked = null;
          }
          return res;
        });
        this.modal={name:acl.name, menus:menus, isNew:false, oldName:acl.name};
      }
      $("#modAclProfile").modal('show');
    },
    checkMenu:function(m) {
      m.checked = !m.checked;
      if (m.checked) m.selAccess = _.clone(m.access);
      else m.selAccess = [];
    },
    checkSubMenu:function(m, sm) {
      if (m.selAccess.includes(sm)) m.selAccess.splice(m.selAccess.indexOf(sm),1);
      else m.selAccess.push(sm);
      if (m.selAccess.length === 0) m.checked = false;
      else if (m.selAccess.length === m.access.length) m.checked = true;
      else m.checked=null;
    },
    getACL:function() {
      this.acls = [];
      this.menus = [];
      tr.post(uri, {a:'getACLProfiles'}, rep=>{
        this.acls = rep.aclProfiles;
        this.menus = rep.menuOptions; //availableMenus
        this.$emit('ACLUpdated',{acls: this.acls, menus: this.menus} );
      });
    },
    saveACLProfile:function() {
      tr.post(uri, {a:'saveACLProfile', m:JSON.stringify(this.modal)}, rep => {
        if (this.modal.isNew) {
          this.acls.push(rep);
          $.notify('ACL Profile added successfully', {className:'success', position:'top center'});
        } else {
          let old = this.acls.find(m => m.name === this.modal.oldName);
          old.name = rep.name;
          old.menus = rep.menus;
          $.notify('ACL Menu updated successfully', {className:'success', position:'top center'});
        }
        $('#modAclProfile').modal('hide');
        this.$emit('ACLUpdated',{acls: this.acls, menus: this.menus});
      });
    },
    delAclProfile:function(acl) {
      Swal.fire({
        title: 'Are you sure?',
        text: `Confirm to delete ACL Profile: ${acl.name}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      }).then((result) => {
        if (result.value) {
          tr.post(uri, {a:'delACLProfile', target:acl.name}, rep=> {
            Swal.fire('Deleted!', `ACL Profile ${acl.name} has been deleted.`, 'success');
            this.acls.splice(this.acls.indexOf(acl),1);
          });
        }
      });
    }
  }
}
</script>

<style scoped>
/* Second level option */
#modACLMenuChoices > div > div > div.ui.checkbox { margin-left: 20px;}
.subACL { margin-left: 20px; }
</style>