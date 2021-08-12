import KoaRouter from 'koa-router'
import _ from 'lodash'
import { SvgFolderManager } from '../service/SvgFolderManager'
const managerService = SvgFolderManager.getInstance()

export const putSvg: KoaRouter.IMiddleware = async (ctx, next) => {
  try {
    const body = _.isEmpty(ctx.request.body) ? ctx.query : ctx.request.body
    await managerService.updateSvg(_.pick(body, ['filename', 'updater.fileContent', 'updater.filename']))
    ctx.body = { data: undefined, error: false, message: 'ok' }
    ctx.status = 200
  } catch (error) {
    ctx.body = error?.message ?? '未知错误'
    ctx.status = 500
  } finally {
    await next()
  }
}