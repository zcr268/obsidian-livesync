export enum LOG_LEVEL {
  TRACE = 0, DEBUG = 100, INFO = 200, WARN = 300, ERROR = 400
}

export class Logger {
  static default_log_level = LOG_LEVEL.INFO


  static err(msg: string) {
    Logger._log(msg, LOG_LEVEL.ERROR)
  }

  static warn(msg: string) {
    Logger._log(msg, LOG_LEVEL.WARN)
  }

  static info(msg: string) {
    Logger._log(msg, LOG_LEVEL.INFO)
  }

  static debug(msg: string) {
    Logger._log(msg, LOG_LEVEL.DEBUG)
  }

  private static _log(msg: string, level: LOG_LEVEL = LOG_LEVEL.INFO) {
    if (level <= Logger.default_log_level) {
      console.log(msg)
    }
  }
}


