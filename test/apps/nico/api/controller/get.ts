import { Context } from '@blastz/nico/typings';

module.exports = async (ctx: Context) => {
  return ctx.ok('test');
};
