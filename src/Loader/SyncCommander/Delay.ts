import { BaseCommander } from './BaseCommander'
import type { QueueCall } from '../../Utils/ExecutorQueue'

export class Delay extends BaseCommander {
    createDoCommand(): QueueCall | void {
        return undefined
    }

    createUndoCommand(): QueueCall | void {
        return undefined
    }
}
