export type QueueCall = () => Promise<void>

export class ExecutorQueue {
  private queue: QueueCall[] = []
  private running: '暂停' | '运行' | '停止' = '停止'
  private finished: Promise<void> = Promise.resolve()
  private done: (value: void | PromiseLike<void>) => void = undefined

  public add(func: QueueCall) {
    this.queue.push(func)
    if (this.running == '停止') {
      this.resume()
    }
  }

  public watchFinished() {

  }

  public pause() {
    this.running = '暂停'
  }

  public resume() {
    this.running = '运行'
    this.run()
  }

  private run() {
    if (this.done == undefined) {
      this.finished = new Promise<void>((resolve) => this.done = resolve)
    }
    while (this.queue.length > 0) {
      // @ts-ignore
      if (this.running == '暂停') {
        break
      }
      this.queue.shift()()
    }
    if (this.running == '运行') {
      this.running = '停止'
      this.done()
      this.done = undefined
    }
  }
}