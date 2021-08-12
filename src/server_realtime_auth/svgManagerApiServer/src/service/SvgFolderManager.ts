import { env, fsExt } from '../util'
import _ from 'lodash'
import fs from 'fs/promises'
import path from 'path'
import resolvePath from 'resolve-path'
import hash from 'hash.js'
import { generateSvgScreenListCode } from './SvgScreenListCodeGenerator'

export interface SvgInfo {
  filename: string;
  // 用来在两端定位某个文件属于某个 svg 视图
  SHA256HashHex: string;
  // 用来在导出时排序, 防止新增的文件被插入到其他位置
  // TODO: 未来可以通过 docker compose 中的 mongodb 或简单的 Json 抽象 db 将顺序持久化, 
  // 注意应将 mongodb 的 connection string 通过环境变量提供, 在 util/env 中参考已实现的添加其引用
  // 注意目前 SvgFolderWatcher 主要维护哈希表 svgMap, svgList 将根据哈希表生成生成, 转移到持久化方
  // 案后应以 svgList 为主
  birthtime: number;
}

/**
 * 单例
 * 单一实例将监视 SvgFolder 目录, 并自动更新内存中的 svg 文件项的结构化数据 svgMap 和 svgList
 * 还提供 svg 文件的增删改查
 */
export class SvgFolderManager {
  // 单例
  private static single = new SvgFolderManager(env.SvgFolder);
  public static getInstance(): SvgFolderManager {
    return SvgFolderManager.single
  }

  private svgFolder: string /* = env.SvgFolder; 在单例实例化时传入构造 */;

  // svgList 由 svgMap 生成, svgMap 主要用于查询和修改
  private svgMap: Record<string, SvgInfo> = {};
  private svgList: SvgInfo[] = [];

  public getSvgList(): SvgInfo[] {
    return this.svgList
  }

  public async addSvg({ filename, fileContent }: { filename: string, fileContent: string }): Promise<void> {
    filename = this.resolveSvgFilename(filename)
    if (this.svgMap[filename] != null) {
      throw new Error('文件名已存在')
    }
    const filePath = resolvePath(this.svgFolder, filename)
    await fs.writeFile(filePath, fileContent)
  }

  public async deleteSvg({ filename }: { filename: string }): Promise<void> {
    filename = this.resolveSvgFilename(filename)
    if (this.svgMap[filename] == null) {
      throw new Error('文件名不存在')
    }
    const filePath = resolvePath(this.svgFolder, filename)
    await fs.unlink(filePath)
  }

  public async updateSvg({ filename, updater }: { filename: string, updater?: { filename?: string, fileContent?: string } }): Promise<void> {
    filename = this.resolveSvgFilename(filename)
    if (updater?.filename) updater.filename = this.resolveSvgFilename(updater.filename)
    if (this.svgMap[filename] == null) {
      throw new Error('文件名不存在')
    }
    const filePath = resolvePath(this.svgFolder, filename)
    let newFilePath = null
    if (updater?.filename != null) {
      newFilePath = resolvePath(this.svgFolder, updater.filename)
      await fs.rename(filePath, newFilePath)
    }
    if (updater?.fileContent) {
      await fs.writeFile(newFilePath ?? filePath, updater.fileContent)
    }
  }

  private async updateSvgScreenList() {
    await fs.writeFile(path.resolve(this.svgFolder, 'screen_list.js'), generateSvgScreenListCode(this.getSvgList()))
  }

  private resolveSvgFilename(filename: string): string {
    const extname = path.extname(filename)
    if (extname != '.svg') {
      filename += extname == '.' ? 'svg' : '.svg'
    }
    return filename
  }

  private generateSvgList(): SvgInfo[] {
    return _.sortBy(_.values(this.svgMap), 'birthtime')
  }

  /**
   * @param svgFolder svg 目录, 从 util/env 下获取
   */
  private constructor(svgFolder: string) {
    this.svgFolder = svgFolder
    this.startWatch(svgFolder)
  }

  private async startWatch(svgFolder: string) {
    this.syncMapAndList()
    for await (const event of fs.watch(svgFolder)) {
      this.onFileChange(event.eventType, event.filename /* 标准库的类型声明有误, pr 等待 merge https://github.com/DefinitelyTyped/DefinitelyTyped/pull/55033 */)
    }
  }

  /**
   * 文件变动回调
   * 由于 fs.watch 的不确定的平台差异性, 这个方法没有使用 eventType 参数, 而
   * 是进行通用的目录缓存同步
   * 每当变动发生, 我们要保证
   * 1. 新增的 svg 文件项被添加到 map
   * 2. 将删除的 svg 文件从 map 中移除
   * 3. 对已存在的被改变的 svg 内容 hash 进行更新
   * 我们是这样做的, 若文件存在且为 svg, 则说明文件已被改变(因为他没有被 rename), 此时
   * 更新其 hash, 此时保证了 3.
   * 然后对任何情况, 分别目录和缓存求差集(syncMapAndList method), 更新 map,
   * 此时保证了 1. 2.
   * @param eventType 
   * @param filename 
   */
  private async onFileChange(eventType: string, filename: string | Buffer): Promise<void> {
    const filePath =
      filename instanceof Buffer
        ? resolvePath(this.svgFolder, filename.toString())
        : resolvePath(this.svgFolder, filename)
    filename = filename instanceof Buffer ? filename.toString() : filename
    // update hash
    if (await fsExt.isFileExist(filePath)) {
      const fileStat = await fs.stat(filePath)
      if (path.extname(filePath) == '.svg' && fileStat.isFile()) {
        const fileContent = (await fs.readFile(filePath)).toString()
        this.svgMap[filename] = {
          filename,
          SHA256HashHex: hash.sha256().update(fileContent).digest('hex'),
          birthtime: fileStat.birthtimeMs,
        }
      } else {
        return
      }
    }
    // sync map and list
    this.syncMapAndList()
  }

  /**
   * 将 SvgFolder 指示的文件列表同步到 this.svgMap
   */
  private async syncMapAndList(): Promise<void> {
    const svgNamesCache: string[] = _.keys(this.svgMap) // or "this.svgList.map((svgInfo: SvgInfo): string => svgInfo.filename)"
    const svgNames: string[] = (await fsExt.getDirSubNames(this.svgFolder)).filter(filename => path.extname(filename) == '.svg' /* 这里没有过滤目录项的类型 && fileStat.idFIle(), 该判断在下方进行 */)
    _.difference(
      svgNamesCache, svgNames,
    ).forEach(redundantFilename => delete this.svgMap[redundantFilename])
    await Promise.all(
      _.difference(
        svgNames, svgNamesCache,
      ).map(async newFilename => {
        const filePath = resolvePath(this.svgFolder, newFilename)
        const fileStat = await fs.stat(filePath)
        if (!fileStat.isFile()) return // 这里承接上方的文件判断
        const fileContent = (await fs.readFile(filePath)).toString()
        this.svgMap[newFilename] = {
          filename: newFilename,
          SHA256HashHex: hash.sha256().update(fileContent).digest('hex'),
          birthtime: fileStat.birthtimeMs,
        }
      })
    )
    this.svgList = this.generateSvgList()
    this.updateSvgScreenList()
  }
}