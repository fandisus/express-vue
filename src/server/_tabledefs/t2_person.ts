import {TableComposer} from '@icfm/trust';

const tc = new TableComposer('persons');
const res = tc.increments('id').primary()
      .integer('uid').foreign('users','id').index()
      .string('name').index()
      .string('email').unique()
      .string('phone', 30).index()
      .string('role', 30).index()
      .string('department',10).index()
      .parse();
export default res;