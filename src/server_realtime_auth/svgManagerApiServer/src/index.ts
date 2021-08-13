import Koa from 'koa'
import KoaRouter from 'koa-router'
import koaBody from 'koa-body'
import { bodyValidator, statusSetter, apiPacker , allowCrossOrigin } from './middleware'
import { deleteSvg, getSvgList, postSvg, putSvg } from './route'

const server: Koa = new Koa()
const router = new KoaRouter()
const port = 8081
export const config = {
  // 用于 json-scada 反向代理
  address: `http://localhost:${port}`,
}

server
  .use(allowCrossOrigin)
  .use(statusSetter)
  .use(koaBody())
  .use(apiPacker)
  /**
   * api
   */
  .use(
    /**
     * interface api {
     *   data: any;
     *   error: boolean;
     *   message: dstring;
     * }
     */
    router
      .get('/svg', getSvgList)
      .put('/svg', bodyValidator('SSS', ['filename', 'updater.fileContent', 'updater.filename']), putSvg)
      .delete('/svg', bodyValidator('S', ['filename']), deleteSvg)
      .post('/svg', bodyValidator('SS', ['filename', 'fileContent']), postSvg)
      .routes()
  )
  .use(router.allowedMethods())
  .listen(port)