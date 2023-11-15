import type {QueueCall} from '../../Utils/ExecutorQueue'
import {BaseLiveSyncPluginHelper} from '../../Base/BaseLiveSyncPluginHelper'


export abstract class BaseCommander extends BaseLiveSyncPluginHelper {

  abstract createDoCommand(): QueueCall

  abstract createUndoCommand(): QueueCall
}