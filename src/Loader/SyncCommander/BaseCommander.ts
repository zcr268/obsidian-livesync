import type { QueueCall } from '../../Utils/ExecutorQueue'
import { BaseLiveSyncPluginHelper } from '../../Base/BaseLiveSyncPluginHelper'
import { SyncTaskManager } from '../SyncTaskMannger'

export abstract class BaseCommander extends BaseLiveSyncPluginHelper {
    abstract createDoCommand(): QueueCall | void

    abstract createUndoCommand(): QueueCall | void

    public mainHead(call: QueueCall) {
        return this.plugin.get(SyncTaskManager).mainHead(call)
    }

    public mainTail(call: QueueCall) {
        return this.plugin.get(SyncTaskManager).mainTail(call)
    }

    public mainSize() {
        return this.plugin.get(SyncTaskManager).mainSize()
    }
}