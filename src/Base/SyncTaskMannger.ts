import {ExecutorQueue} from '../Utils/ExecutorQueue'

class SyncTaskMannger {
  private mainQueue: ExecutorQueue = new ExecutorQueue()
  private subQueue: ExecutorQueue[] = [new ExecutorQueue(), new ExecutorQueue()]
}