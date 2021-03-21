import {TableComposer} from '@icfm/trust';

const tc = new TableComposer('users');
const res = tc.increments('id').primary()
      .string('username').unique()
      .string('password', 100)
      .string('email').index()
      .string('phone').index()
      .jsonb('login_sys').ginPropIndex('cookie','forgot','activation')  //expiries
      .jsonb('login_info') //last_login, join_date
      .jsonb('other_info')
      .parse();
export default res;