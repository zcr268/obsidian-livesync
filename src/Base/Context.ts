export type Class<T> = (new (opt: any) => T) | (new () => T)

export class Context {
    map: Map<Class<any>, any> = new Map<Class<any>, any>()

    get<T>(k: Class<T>): T {
        return this.map.get(k) as T
    }

    register<T>(k: Class<T>, v: T) {
        if (this.map.has(k)) {
            throw new Error(`${k.name} already registered`)
        }
        this.map.set(k, v)
    }
}
