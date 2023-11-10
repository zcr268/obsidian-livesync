export type QueueCall = () => Promise<void>

enum State {
    end,
    pause,
    running,
    break,
}
export class ExecutorQueue {
    private queue: QueueCall[] = []
    private state: State = State.end
    private finished: Promise<void> = Promise.resolve()
    private done: (value: void | PromiseLike<void>) => void = undefined

    public add(func: QueueCall) {
        this.queue.push(func)
        this.resume()
    }

    public watchFinished() {
        return this.finished
    }

    public pause() {
        this.state = State.pause
    }

    public break() {
        this.state = State.break
        return this.watchFinished()
    }

    public resume() {
        if (this.state == State.end || this.state == State.pause) {
            this.state = State.running
            this.run().then(console.log)
        }
    }

    public size() {
        return this.queue.length
    }

    private async run() {
        if (this.done == undefined) {
            this.finished = new Promise<void>((resolve) => (this.done = resolve))
        }
        while (this.queue.length > 0) {
            if (this.state != State.running) {
                break
            }
            await this.queue.shift()()
        }
        if (this.state == State.break) {
            this.queue = []
        }
        if (this.queue.length == 0) {
            this.done()
            this.done = undefined
            this.state = State.end
        }
    }
}