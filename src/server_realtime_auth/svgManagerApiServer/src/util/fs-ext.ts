/**
 * 这个文件封装了基于 fs 的一些实用工具方法
 */
import { constants as fsConstants } from 'fs'
import fs from 'fs/promises'

export const fsExt = {
  async isFileExist(path: string): Promise<boolean> {
    try {
      await fs.access(path, fsConstants.F_OK)
      return true
    } catch (error) {
      return false
    }
  },

  async getDirSubNames(dirPath: string): Promise<string[]> {
    const subDirentNames: string[] = []
    for await (const dir of await fs.opendir(dirPath)) {
      subDirentNames.push(dir.name)
    }
    return subDirentNames
  },
}
