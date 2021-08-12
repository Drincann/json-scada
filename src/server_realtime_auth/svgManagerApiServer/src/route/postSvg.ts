import KoaRouter from 'koa-router'
import _ from 'lodash'
import { SvgFolderManager } from '../service/SvgFolderManager'
const managerService = SvgFolderManager.getInstance()

export const postSvg: KoaRouter.IMiddleware = async (ctx, next) => {
  try {
    const body = _.isEmpty(ctx.request.body) ? ctx.query : ctx.request.body
    await managerService.addSvg(_.pick(body, ['filename', 'fileContent']))
    ctx.body = undefined
    ctx.status = 200
  } catch (error) {
    ctx.body = error?.message ?? '未知错误'
    ctx.status = 500
  } finally {
    await next()
  }
}