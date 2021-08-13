import Koa from 'koa'

/**
 * 允许跨域请求
 */
export const allowCrossOrigin: Koa.Middleware = async (ctx, next) => {
  await next()
  ctx.set('Access-Control-Allow-Origin', '*')
  ctx.set('Access-Control-Allow-Headers', '*')
  ctx.set('Access-Control-Allow-Methods', '*')
}