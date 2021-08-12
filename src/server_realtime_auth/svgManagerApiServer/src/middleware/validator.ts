import Koa from 'koa'
import _ from 'lodash'
import { aproba } from '../util/index'

/**
 * 参数验证器
 * @param validator aproba 的验证字符串
 * @param pick 对 ctx.request.body 的属性值按照该参数的顺序进行拣选
 * @returns Koa 中间件
 */
export function bodyValidator(validator: string, pick: string[]): Koa.Middleware {
  return async (ctx, next) => {
    try {
      const body = _.isEmpty(ctx.request.body) ? ctx.query : ctx.request.body
      aproba(validator, pick.map?.(fieldname => _.get(body, fieldname)))
      await next()
    } catch (error) {
      ctx.status = 400
      ctx.body = error.message
    }
  }
}