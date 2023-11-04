export class Json {
  static tryDecodeJson(encoded: string | false): object | false {
    try {
      if (!encoded) return false
      return JSON.parse(encoded)
    } catch (ex) {
      return false
    }
  }
}
