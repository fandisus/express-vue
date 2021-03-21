<template>
  <span>
    <i v-if='getSortDir(col) == "asc"' class="sort up icon"></i>
    <i v-else-if='getSortDir(col) == "desc"' class="sort down icon"></i>
  </span>
</template>

<script>
  import _ from 'lodash';
  //Note: This components need the parent to have "sorts" field: [{col:"colname"},{}]
  //And also need it to implement its own sort event (e.g. sortBy())
  export default {
    props:['col'],
    methods:{
      getSortDir:function(col) {
        //Ketika $parent.sorts berubah, semua sortdir ikut berubah dan jalankan method ini. Perlu efisiensi.
        var oSort = _.find(this.$parent.sorts, function(obj) { return obj.col === col; });
        if (oSort === undefined) return null;
        return oSort.dir;
      },
    },
  };
</script>