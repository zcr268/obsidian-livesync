import type { ValueWrap } from './GetRealValue'
import { GetValue } from './GetRealValue'

export class SegmentationText {
    static async *segment(data: ValueWrap<string>, size = -1): AsyncGenerator<string> {
        let content = await GetValue.get(data)
        if (size > 0) {
            do {
                // split to within maximum pieceSize
                let ps = size
                if (content.charCodeAt(ps - 1) != content.codePointAt(ps - 1)) {
                    // If the char at the end of the chunk has been part of the surrogate pair, grow the piece size a bit.
                    ps++
                }
                yield content.substring(0, ps)
                content = content.substring(ps)
            } while (content != '')
        } else {
            yield content
        }
    }
}
