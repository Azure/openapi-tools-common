// tslint:disable:no-expression-statement

import { addPosition } from "../libs/add-position";

describe("addPosition", () => {
    it("'h'", () => {
        const result = addPosition("h")
            .toArray()
        expect(result)
            .toEqual([{ c: "h", position: { line: 1, column: 1 }}, { c: "", position: { line: 1, column: 2 }}])
    })
    it("'h\\nw'", () => {
        const result = addPosition("h\nw")
            .toArray()
        expect(result)
            .toEqual([
                { c: "h", position: { line: 1, column: 1 }},
                { c: "\n", position: { line: 1, column: 2 }},
                { c: "w", position: { line: 2, column: 1 }},
                { c: "", position: { line: 2, column: 2 }},
            ])
    })
    it("json", () => {
        const result = addPosition("  { \"x\": 2\n }  ")
            .toArray()
        expect(result)
            .toEqual([
                { c: " ", position: { line: 1, column: 1 }},
                { c: " ", position: { line: 1, column: 2 }},
                { c: "{", position: { line: 1, column: 3 }},
                { c: " ", position: { line: 1, column: 4 }},
                { c: "\"", position: { line: 1, column: 5 }},
                { c: "x", position: { line: 1, column: 6 }},
                { c: "\"", position: { line: 1, column: 7 }},
                { c: ":", position: { line: 1, column: 8 }},
                { c: " ", position: { line: 1, column: 9 }},
                { c: "2", position: { line: 1, column: 10 }},
                { c: "\n", position: { line: 1, column: 11 }},
                { c: " ", position: { line: 2, column: 1 }},
                { c: "}", position: { line: 2, column: 2 }},
                { c: " ", position: { line: 2, column: 3 }},
                { c: " ", position: { line: 2, column: 4 }},
                { c: "", position: { line: 2, column: 5 }}
            ])
    })
    it("eof", () => {
        expect("" < "\u0000")
            .toBe(true)
    })
})
