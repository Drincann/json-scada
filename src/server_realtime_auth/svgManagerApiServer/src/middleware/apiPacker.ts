import Koa from 'koa'

/**
 * 包装 body api
 * 这里认为只有成功或不成功两种情况
 */
export const apiPacker: Koa.Middleware = async (ctx, next) => {
  await next()
  if (ctx.status == 200) {
    ctx.body = { data: ctx.body, error: false, message: 'ok' }
  } else {
    ctx.body = { data: undefined, error: true, message: ctx.body }
  }
}