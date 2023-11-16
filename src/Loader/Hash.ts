import { default as xxhashNew } from '../Base/patched_xxhash_wasm/xxhash-wasm.js'
import type { XXHashAPI } from 'xxhash-wasm-102'
import { BaseLoader, GlobalLoaderManager } from './BaseLoader'

export class Hash extends BaseLoader {
    public h32ToString: (input: string, seed?: number) => string
    public h32Raw: (inputBuffer: Uint8Array, seed?: number) => number
    public h32: (input: string, seed?: number) => number
    public h64: (input: string, seed?: bigint) => bigint

    onload(): void | Promise<void> {
        return new Promise<void>(async (resolve) => {
            const { h32ToString, h32Raw, h32, h64 } = await (xxhashNew as unknown as () => Promise<XXHashAPI>)()
            this.h32ToString = h32ToString
            this.h32Raw = h32Raw
            this.h32 = h32
            this.h64 = h64
        })
    }
}

GlobalLoaderManager.registryLoader(Hash)
