import {TableComposer} from '@icfm/trust';

const tc = new TableComposer('user_acl');
const res = tc.integer('uid').foreign('users', 'id').primary()
      .string('profile').foreign('acl_profiles', 'name', 'CASCADE', 'SET NULL')
      .parse();
export default res;