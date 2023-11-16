export class TimerTask {
  static tasks: { [key: string]: { callback: () => Promise<any> | void; cancel: ReturnType<typeof setTimeout> } } = {}

  /**
   *
   * @param key
   * @param timeout
   * @param proc
   * @param skipOrReplaceIfTaskExist 如果 true 存在 则 跳过, undefined 则 重新计时 false 则 不重新计时但是会替换任务
   */
  static scheduleTask(key: string, timeout: number, proc: () => Promise<any> | void, skipOrReplaceIfTaskExist?: boolean) {
    if (skipOrReplaceIfTaskExist != undefined && key in TimerTask.tasks) {
      if (!skipOrReplaceIfTaskExist) {
        TimerTask.tasks[key].callback = proc
      }
      return
    }
    TimerTask.cancelTask(key)
    const cancel = setTimeout(async () => {
      const callback = TimerTask.tasks[key].callback
      delete TimerTask.tasks[key]
      callback?.()
    }, timeout)
    TimerTask.tasks[key] = {
      callback: proc, cancel: cancel,
    }
  }

  static cancelTask(key: string) {
    if (key in TimerTask.tasks) {
      clearTimeout(TimerTask.tasks[key].cancel)
      delete TimerTask.tasks[key]
    }
  }

  static cancelAllTasks() {
    for (const v in TimerTask.tasks) {
      clearTimeout(TimerTask.tasks[v].cancel)
      delete TimerTask.tasks[v]
    }
  }

  static intervals: { [key: string]: ReturnType<typeof setInterval> } = {}

  static setPeriodicTask(key: string, timeout: number, proc: () => Promise<any> | void) {
    TimerTask.cancelPeriodicTask(key)
    TimerTask.intervals[key] = setInterval(async () => {
      delete TimerTask.intervals[key]
      await proc()
    }, timeout)
  }

  static cancelPeriodicTask(key: string) {
    if (key in TimerTask.intervals) {
      clearInterval(TimerTask.intervals[key])
      delete TimerTask.intervals[key]
    }
  }

  static cancelAllPeriodicTask() {
    for (const v in TimerTask.intervals) {
      clearInterval(TimerTask.intervals[v])
      delete TimerTask.intervals[v]
    }
  }

  static async delay(millisecond: number) {
    return new Promise(resolve => {
      setTimeout(resolve, millisecond)
    })
  }
}
