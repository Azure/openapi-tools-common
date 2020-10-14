import * as iterator from "@azure-openapi-tools/iterator"

export type Position = {
    /**
     * Line number. Starts with 1.
     */
    readonly line: number
    /**
     * Column number. Starts with 1.
     */
    readonly column: number
}

export type CharAndPosition = {
    /**
     * Character.
     */
    readonly c: string
    /**
     * Position.
     */
    readonly position: Position
}

export const terminal = ""

export const addPosition = (i: Iterable<string>): iterator.IterableEx<CharAndPosition> =>
    iterator
        .concat(i, [terminal])
        .flatScan(
            (position, c) => [
                c === "\n"
                    ? { line: position.line + 1, column: 1 }
                    : { line: position.line, column: position.column + 1 },
                [{ c, position }],
            ],
            { line: 1, column: 1}
        )
