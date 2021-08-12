import KoaRouter from 'koa-router'
import { SvgFolderManager } from '../service/SvgFolderManager'

const managerService = SvgFolderManager.getInstance()

export const getSvgList: KoaRouter.IMiddleware = async (ctx, next) => {
  try {
    ctx.body = managerService.getSvgList()
    ctx.status = 200
  } catch (error) {
    ctx.body = error?.message ?? '未知错误'
    ctx.status = 500
  } finally {
    await next()
  }
}