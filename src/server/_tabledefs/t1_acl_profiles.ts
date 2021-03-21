import {TableComposer} from '@icfm/trust';

const tc = new TableComposer('acl_profiles');
const res = tc.string('name').primary()
      .jsonb('menus')
      .parse();
export default res;