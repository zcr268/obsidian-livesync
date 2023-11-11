export type ValueFunc<T> = (() => T) | (() => Promise<T>)
export type Value<T> = T | Promise<T>
export type ValueWrap<T> = Value<T> | ValueFunc<T>

export class GetValue {
    static async get<T>(v: ValueWrap<T>): Promise<T> {
        let value = v
        if (value instanceof Function) {
            value = value()
        }
        return value
    }
}
