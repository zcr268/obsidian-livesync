import { ExecutorQueue } from '../Utils/ExecutorQueue'
import { Logger } from '../Base/Logger'
import { Settings } from '../Base/Settings'
import { BaseLoader, GlobalLoaderManager } from './BaseLoader'
import { Context, type Class } from '../Base/Context'
import { type FilePath } from '../lib/src/types'
import { StatusBar } from './StatusBar'

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
        // const list = '🔴 🔵 ⏪ ⏩ 💤 🌀 ⁉ ☁ 💭 💻 ⚠ ⛔ 🚫'.split(' ')
        // const list = '🌕 🌖 🌗 🌘 🌑 🌒 🌓 🌔'.split(' ')
        const list = '🌕 🌔 🌓 🌒 🌑 🌘 🌗 🌖'.split(' ')
        let list2 = this.app.vault.getFiles()
        const apply = () => {
            const now = new Date().getTime()
            Logger.trace(`当前msg:${now}\ntest:msg`)
            list.push(list.shift())
            if (list2.length == 0) {
                list2 = this.app.vault.getFiles()
            }
            const msg = (list2.shift()?.path as FilePath) ?? ''
            this.plugin.get(StatusBar)?.setStatusBarText(list[0], `当前msg:${now}\nfileName:${msg}`)
            setTimeout(apply, 100)
        }
        apply()
        return undefined
    }
}

GlobalLoaderManager.registryLoader(SyncTaskManager, 30)
