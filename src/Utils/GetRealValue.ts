export type ValueFunc<T> = () => T
export type Value<T> = T
export type ValueWrap<T> = Value<T> | ValueFunc<T>

export type AsyncValueFunc<T> = () => Promise<T>
export type AsyncValue<T> = Promise<T>
export type AsyncValueWrap<T> = AsyncValue<T> | AsyncValueFunc<T>

export type AnyValue<T> = ValueWrap<T> | AsyncValueWrap<T>
export class GetValue {
    static async getAny<T>(v: AnyValue<T>): Promise<T> {
        let value = v
        if (value instanceof Function) {
            value = value()
        }
        return value
    }

    static get<T>(v: ValueWrap<T>): T {
        let value = v
        if (value instanceof Function) {
            value = value()
        }
        return value
    }
}
