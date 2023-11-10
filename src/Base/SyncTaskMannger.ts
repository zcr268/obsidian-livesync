import {ExecutorQueue} from '../Utils/ExecutorQueue'

class SyncTaskManager {
  private mainQueue: ExecutorQueue = new ExecutorQueue()
  private subQueue: ExecutorQueue[] = [new ExecutorQueue()]
}