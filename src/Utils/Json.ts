export class Json {
  static tryDecodeJson(encoded: string | false): object | false {
    try {
      if (!encoded) return false
      return JSON.parse(encoded)
    } catch (ex) {
      return false
    }
  }

  static tryEncodeJson(obj: any): string | false {
    try {
      if (!obj) return false
      return JSON.stringify(obj)
    } catch (ex) {
      return false
    }
  }
}
