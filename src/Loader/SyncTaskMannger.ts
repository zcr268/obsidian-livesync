import { ExecutorQueue, type QueueCall } from '../Utils/ExecutorQueue'
import { Logger } from '../Base/Logger'
import { Settings } from '../Base/Settings'
import { BaseLoader, GlobalLoaderManager } from './BaseLoader'
import { Context, type Class } from '../Base/Context'

import { WatchLocalFiles } from './SyncCommander/WatchLocalFiles'
import { Hash } from './Hash'

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

    public mainSize(){
        return this.mainQueue.size()
    }

    public mainHead(call: QueueCall) {
        return this.mainQueue.head(call)
    }

    public mainTail(call: QueueCall) {
        return this.mainQueue.tail(call)
    }

    private hashing(key: string) {
        return this.plugin.get(Hash).h64(key)
    }

    private mod(key: string) {
        return Number(this.hashing(key) % BigInt(this.subQueue.length))
    }

    private modQueue(key: string) {
        return this.subQueue[this.mod(key)]
    }

    public subHead(call: QueueCall, key: string) {
        return this.modQueue(key).head(call)
    }

    public subTail(call: QueueCall, key: string) {
        return this.modQueue(key).tail(call)
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
                this.registerContext(WatchLocalFiles, new WatchLocalFiles(this.plugin))
                this.get(WatchLocalFiles).createDoCommand()
            } catch (error) {
                Logger.err(error)
                return reject(error)
            }
            return resolve()
        })
    }
}

GlobalLoaderManager.registryLoader(SyncTaskManager, 30)
