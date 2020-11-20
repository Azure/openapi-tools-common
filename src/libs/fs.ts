import * as fs from "fs"
import * as path from "path"
import * as asyncIt from "./async-iterator"
import * as util from "util"

export const asyncReadFile = util.promisify(fs.readFile)

export const asyncWriteFile = util.promisify(fs.writeFile)

export const asyncExists = util.promisify(fs.exists)

export const asyncReaddir = util.promisify(fs.readdir)

export const asyncMkdir = util.promisify(fs.mkdir)

export const asyncRmdir = util.promisify(fs.rmdir)

export const asyncUnlink = util.promisify(fs.unlink)

export const asyncRecursiveReaddir = (dir: string): asyncIt.AsyncIterableEx<string> =>
    asyncIt.asyncFromPromise(asyncReaddir(dir, { withFileTypes: true })).flatMap(
        f => {
            const p = path.join(dir, f.name)
            return f.isDirectory() ?  asyncRecursiveReaddir(p) : asyncIt.asyncFromSequence(p)
        }
    )

export const asyncRecursiveRmdir = async (dir: string): Promise<void> => {
    const list = await asyncReaddir(dir, { withFileTypes: true })
    await Promise.all(list.map(async f => {
        const p = path.join(dir, f.name)
        if (f.isDirectory()) {
            await asyncRecursiveRmdir(p)
        } else {
            await asyncUnlink(p)
        }
    }))
    await asyncRmdir(dir)
}