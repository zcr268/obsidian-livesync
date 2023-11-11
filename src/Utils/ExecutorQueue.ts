export type QueueCall = (id: number) => Promise<void>
type CallInfo = { id: number; call: QueueCall }

enum State {
    end,
    pause,
    running,
    break,
}
export class ExecutorQueue {
    private queue: CallInfo[] = []
    private selfIncrementingId = 0
    private state: State = State.end
    private finished: Promise<void> = Promise.resolve()
    private finishResolve: (value: void | PromiseLike<void>) => void = undefined
    private paused: Promise<void> = Promise.resolve()
    private pausedResolve: (value: void | PromiseLike<void>) => void = undefined

    public tail(call: QueueCall) {
        const id = this.selfIncrementingId++
        this.queue.push({ id, call })
        this.resume([State.end])
        return id
    }

    public head(call: QueueCall) {
        const id = this.selfIncrementingId++
        this.queue.unshift({ id, call })
        this.resume([State.end])
        return id
    }

    public watchFinished() {
        return this.finished
    }

    public pause() {
        this.state = State.pause
        if (this.pausedResolve == undefined) {
            this.paused = new Promise<void>((resolve) => (this.pausedResolve = resolve))
        }
        return this.paused
    }

    public break() {
        this.state = State.break
        return this.watchFinished()
    }

    public resume(resumeState: [State.end, State.pause] | [State.end] | [State.pause] = [State.pause]) {
        if (this.state in resumeState) {
            this.state = State.running
            this.run().then(console.log)
            return true
        }
        return false
    }

    public removeById(id: number) {
        this.queue = this.queue.filter((e) => e.id != id)
    }

    public size() {
        return this.queue.length
    }

    private async run() {
        if (this.finishResolve == undefined) {
            this.finished = new Promise<void>((resolve) => (this.finishResolve = resolve))
        }
        while (this.queue.length > 0) {
            if (this.state != State.running) {
                break
            }
            const info = this.queue.shift()
            await info.call(info.id)
        }
        if (this.state == State.break) {
            this.queue = []
        }
        if (this.state == State.pause) {
            this.pausedResolve()
            this.pausedResolve = undefined
        }
        if (this.queue.length == 0) {
            this.finishResolve()
            this.finishResolve = undefined
            this.state = State.end
        }
    }
}