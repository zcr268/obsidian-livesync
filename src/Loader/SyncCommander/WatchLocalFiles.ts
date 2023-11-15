import type {QueueCall} from '../../Utils/ExecutorQueue'
import {Logger} from '../../Base/Logger'
import {BaseCommander} from './BaseCommander'
import type {EventRef} from 'obsidian'


export class WatchLocalFiles extends BaseCommander {
  private eventRef: EventRef | undefined = undefined

  createDoCommand(): QueueCall {
    return async (id: number) => {
      if (this.eventRef) {
        this.app.vault.offref(this.eventRef)
        this.eventRef = undefined
      }
      // @ts-ignore
      this.eventRef = this.app.vault.on('raw', (fullFilePath) => {
        Logger.info(`${fullFilePath} changed`)
      })
      this.plugin.registerEvent(this.eventRef)
    }
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