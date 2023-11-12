import { ExecutorQueue } from '../Utils/ExecutorQueue'
import { Logger } from '../Base/Logger'
import { Settings } from '../Base/Settings'
import { BaseLoader, GlobalLoaderManager } from './BaseLoader'
import { Context, type Class } from '../Base/Context'
import { StatusBar } from './StatusBar'
import { Json } from '../Utils/Json'
import PouchDB from 'pouchdb'

export class SyncTaskManager extends BaseLoader {
    private mainQueue: ExecutorQueue = new ExecutorQueue()
    private subQueue: ExecutorQueue[] = [new ExecutorQueue()]
    private context: Context = new Context()

    public changeSubQueueSize() {
        this.breakAllSubTask().catch((e) => Logger.err(`关闭子任务失败：${e}`))
        this.mainQueue.head(async (id) => {
            await this.waitAllSubTask()
            const batchSize = this.plugin.get(Settings).settings.batch_size
            this.subQueue = []
            for (let i = 0; i < batchSize; i++) {
                this.subQueue.push(new ExecutorQueue())
            }
        })
    }

    public async waitAllSubTask() {
        return Promise.all(this.subQueue.map((queue) => queue.watchFinished()))
    }

    public async breakAllSubTask() {
        return Promise.all(this.subQueue.map((queue) => queue.break()))
    }

    public get<T>(k: Class<T>): T | undefined {
        return this.context.get<T>(k)
    }

    public registerContext<T>(k: Class<T>, v: T) {
        this.context.register<T>(k, v)
    }

    onload(): void | Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            try {
                // const list = '🔴 🔵 ⏪ ⏩ 💤 🌀 ⁉ ☁ 💭 💻 ⚠ ⛔ 🚫'.split(' ')
                // const list = '🌕 🌖 🌗 🌘 🌑 🌒 🌓 🌔'.split(' ')
                const list = '🌕 🌔 🌓 🌒 🌑 🌘 🌗 🌖'.split(' ')
                const apply = () => {
                    const now = new Date().getTime()
                    Logger.trace(`当前msg:${now}\ntest:msg`)
                    list.push(list.shift())

                    this.plugin.get(StatusBar)?.setStatusBarText(list[0], null)
                    setTimeout(apply, 100)
                }
                apply()
                const localDB = new PouchDB('test')
                const handle = localDB.changes({
                    since: 'now',
                    live: true,
                })
                // await localDB.get('local_seq')
                handle
                    .on('change', (change) => {
                        Logger.info(`localDB change:${Json.tryEncodeJson(change)}`)
                    })
                    .on('error', (error) => {
                        Logger.err(`localDB error:${error}`)
                    })

                /**
                 * 所有文件加载
                 */
                this.plugin.registerEvent(
                    // @ts-ignore
                    this.app.vault.on('raw', (fullFilePath) => {
                        Logger.info(`${fullFilePath} changed`)
                    })
                )
            } catch (error) {
                Logger.err(error)
                return reject(error)
            }
            return resolve()
        })
    }
}

GlobalLoaderManager.registryLoader(SyncTaskManager, 30)
