import type { QueueCall } from '../../Utils/ExecutorQueue'
import { Logger } from '../../Base/Logger'
import { BaseCommander } from './BaseCommander'
import type { EventRef } from 'obsidian'
import PouchDB from 'pouchdb'
import { Json } from '../../Utils/Json'
import { StatusBar } from '../StatusBar'
import { TimerTask } from '../../Utils/TimerTask'

export class WatchLocalFiles extends BaseCommander {
    private eventRef: EventRef | undefined = undefined
    private filePathSet: Set<string> = new Set<string>()
    private filePathArray: Array<string> = new Array<string>()

    createDoCommand() {
        this.mainTail(async () => {
            if (this.eventRef) {
                this.app.vault.offref(this.eventRef)
                this.eventRef = undefined
            }
            // @ts-ignore
            this.eventRef = this.app.vault.on('raw', (fullFilePath) => {
                const path = fullFilePath as unknown as string
                Logger.info(`${path} changed`)
                if (!this.filePathSet.has(path)) {
                    this.filePathSet.add(path)
                    this.filePathArray.push(path)
                }
            })
            this.plugin.registerEvent(this.eventRef)

            // const list = '🔴 🔵 ⏪ ⏩ 💤 🌀 ⁉ ☁ 💭 💻 ⚠ ⛔ 🚫'.split(' ')
            // const list = '🌕 🌖 🌗 🌘 🌑 🌒 🌓 🌔'.split(' ')
            const list = '🌕 🌔 🌓 🌒 🌑 🌘 🌗 🌖'.split(' ')

            const localDB = new PouchDB('test')
            const handle = localDB.changes({
                since: 'now',
                live: true,
            })
            handle
                .on('change', (change) => {
                    Logger.info(`localDB change:${Json.tryEncodeJson(change)}`)
                })
                .on('error', (error) => {
                    Logger.err(`localDB error:${error}`)
                })
            while (this.mainSize() == 0) {
                const now = new Date().getTime()
                Logger.trace(`当前msg:${now}\ntest:msg`)
                list.push(list.shift())
                if (this.filePathArray.length > 0) {
                    const path = this.filePathArray.shift()
                    this.filePathSet.delete(path)
                    this.plugin.get(StatusBar)?.setStatusBarText(list[0], path)
                } else {
                    this.plugin.get(StatusBar)?.setStatusBarText(list[0], null)
                }
                await TimerTask.delay(100)
            }
        })
    }

    createUndoCommand(): QueueCall {
        return async (id: number) => {
            if (this.eventRef) {
                this.app.vault.offref(this.eventRef)
                this.eventRef = undefined
            }
        }
    }
}