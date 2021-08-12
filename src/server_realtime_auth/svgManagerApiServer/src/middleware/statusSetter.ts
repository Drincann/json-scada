import Koa from 'koa'

/**
 * 若已修改过 status, 则不作任何操作
 * 若未修改过 status, 检查 body 是否具有值, 若具有则 status 置 200
 */
export const statusSetter: Koa.Middleware = async (ctx, next) => {
  await next()
  if (ctx.status != 404) return
  if (ctx.body != null) {
    ctx.status = 200
  }
}