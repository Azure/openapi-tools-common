import * as assert from "assert";
import { parseJson, ParseError, tokenize } from "../libs/json-parser";
import { getInfo, objectInfoSymbol } from '../libs/source-map';
import { JsonArray } from '../libs/json';
import { toArray } from "../libs/iterator";
import * as fs from "fs";

describe("parse", () => {
    it("empty", () => {
        const errors: Array<ParseError> = []
        const json = parseJson(
            "fakeurl.json",
            "",
            e => errors.push(e)
        )
        assert.strictEqual(json, null)
        assert.equal(errors.length, 1)
        const x = errors[0]
        assert.equal(x.code, "unexpected end of file")
        assert.equal(x.message, "unexpected end of file, token: , line: 1, column: 1")
    })
    it("null", () => {
        const errors: Array<ParseError> = []
        const json = parseJson(
            "fakeurl.json",
            "null",
            e => errors.push(e)
        )
        assert.strictEqual(json, null)
        assert.equal(errors.length, 0)
    })
    it("number", () => {
        const errors: Array<ParseError> = []
        const json = parseJson(
            "fakeurl.json",
            "+234.56e-1",
            e => errors.push(e)
        )
        assert.equal(json, 23.456)
        assert.equal(errors.length, 0)
    })
    it("string", () => {
        const errors: Array<ParseError> = []
        const json = parseJson(
            "fakeurl.json",
            "  \"hello world!\"  ",
            e => errors.push(e)
        )
        assert.equal(json, "hello world!")
        assert.equal(errors.length, 0)
    })
    it("empty object", () => {
        const errors: Array<ParseError> = []
        const json = parseJson(
            "fakeurl.json",
            "  { \n }  ",
            e => errors.push(e)
        )
        assert.deepEqual(json, {})
        assert.equal(errors.length, 0)
    })
    it("empty array", () => {
        const errors: Array<ParseError> = []
        const json = parseJson(
            "fakeurl.json",
            "  [ \n    \n\t  ]  ",
            e => errors.push(e)
        )
        assert.deepEqual(json, [])
        assert.equal(errors.length, 0)
    })
    it("object with one property", () => {
        const errors: Array<ParseError> = []
        const json = parseJson(
            "fakeurl.json",
            "  { \"x\": 2\n }  ",
            e => errors.push(e)
        )
        if (json === null || typeof json !== "object") {
            throw new Error("not object")
        }
        const info = getInfo(json)
        if (info === undefined || info.isChild) {
            throw new Error("info")
        }
        assert.equal(info.position.line, 1)
        assert.equal(info.position.column, 3)

        assert.equal(info.url, "fakeurl.json")
        assert.deepEqual(json, { x: 2 })
        assert.equal(errors.length, 0)
    })
    it("object with three properties", () => {
        const errors: Array<ParseError> = []
        const json = parseJson(
            "fakeurl.json",
            "  { \"x\": 2\n, \"\": true, \"rrr\":\n\n\n \t[] }  ",
            e => errors.push(e)
        )

        const jsonRrr: JsonArray = (json as any).rrr
        const info = getInfo(jsonRrr)
        if (info === undefined || !info.isChild) {
            throw new Error("info")
        }
        assert.equal(info.position.line, 5)
        assert.equal(info.position.column, 3)

        assert.equal(info.property, "rrr")
        const parentInfo = info.parent[objectInfoSymbol]()
        if (parentInfo.isChild) {
            throw new Error("info")
        }

        assert.deepEqual(json, { x: 2, "": true, rrr: [] })
        assert.equal(errors.length, 0)
    })
    it("array with one item", () => {
        const errors: Array<ParseError> = []
        const json = parseJson(
            "fakeurl.json",
            "  [ false ]  ",
            e => errors.push(e)
        )
        assert.deepEqual(json, [false])
        assert.equal(errors.length, 0)
    })
    it("array with three items", () => {
        const errors: Array<ParseError> = []
        const json = parseJson(
            "fakeurl.json",
            "  [ false, { \"na::\": [ null, true] }, -456 ]  ",
            e => errors.push(e)
        )
        assert.deepEqual(json, [false, { "na::": [null, true]}, -456])
        assert.equal(errors.length, 0)

        const na = (json as any)[1]["na::"]
        const info = getInfo(na)
        if (info === undefined || !info.isChild) {
            throw new Error("info")
        }
        assert.equal(info.property, "na::")
    })
    it("two values", () => {
        const errors: Array<ParseError> = []
        const json = parseJson(
            "fakeurl.json",
            " false true ",
            e => errors.push(e)
        )
        assert.deepEqual(json, false)
        assert.equal(errors.length, 1)
        const error = errors[0]
        assert.equal(error.code, "unexpected token")
        assert.equal(error.message, "unexpected token, token: true, line: 1, column: 8")
    })
    it("two tokens after value", () => {
        const errors: Array<ParseError> = []
        const json = parseJson(
            "fakeurl.json",
            " {} [] ",
            e => errors.push(e)
        )
        assert.deepEqual(json, {})
        assert.equal(errors.length, 1)
    })
    it("invalid second property", () => {
        const errors: Array<ParseError> = []
        const json = parseJson(
            "fakeurl.json",
            " { \"\": 4 5 }",
            e => errors.push(e)
        )
        assert.deepEqual(json, { "": 4 })
        assert.equal(errors.length, 1)
    })
    it("invalid property separator", () => {
        const errors: Array<ParseError> = []
        const json = parseJson(
            "fakeurl.json",
            " { \"\" 4 }",
            e => errors.push(e)
        )
        assert.deepEqual(json, {})
        assert.strictEqual(errors.length > 0, true)
    })
    it("invalid property name", () => {
        const errors: Array<ParseError> = []
        const json = parseJson(
            "fakeurl.json",
            " { [] }",
            e => errors.push(e)
        )
        assert.deepEqual(json, {})
        assert.strictEqual(errors.length > 0, true)
    })
    it("strange property name", () => {
        const errors: Array<ParseError> = []
        const json = parseJson(
            "fakeurl.json",
            " { 45:54 }",
            e => errors.push(e)
        )
        assert.deepEqual(json, { "45": 54 })
        assert.equal(errors.length, 1)
    })
    it("null property name", () => {
        const errors: Array<ParseError> = []
        const json = parseJson(
            "fakeurl.json",
            " { null:54 }",
            e => errors.push(e)
        )
        assert.deepEqual(json, { "null": 54 })
        assert.equal(errors.length, 1)
    })
    it("array with no separator", () => {
        const errors: Array<ParseError> = []
        const json = parseJson(
            "fakeurl.json",
            " [ null \n +567.4e-56]",
            e => errors.push(e)
        )
        assert.deepEqual(json, [null])
        assert.equal(errors.length, 1)
    })
    it("invalid json", () => {
        const errors: Array<ParseError> = []
        const json = parseJson(
            "fakeurl.json",
            " } []",
            e => errors.push(e)
        )
        assert.deepEqual(json, [])
        assert.equal(errors.length, 1)
    })
    it("testCase", () => {
        const url = "./src/tests/json-parser-testdata.json"
        const context = fs.readFileSync(url).toString()
        parseJson(url, context, e => { throw e })
    })
})

describe("tokenize", () => {
    it("empty", () => {
        const errors: ParseError[] = []
        const result = toArray(tokenize("", e => errors.push(e), "url")) as any[]
        assert.deepStrictEqual(result, [])
        assert.equal(errors.length, 0)
    })
    it("spaces", () => {
        const errors: ParseError[] = []
        const result = toArray(tokenize("   \t\n   ", e => errors.push(e), "url")) as any[]
        assert.deepStrictEqual(result, [])
        assert.equal(errors.length, 0)
    })
    it("string", () => {
        const errors: ParseError[] = []
        const ir = tokenize(" \"xxx\"   ", e => errors.push(e), "url")
        const result = toArray(ir)
        assert.equal(result.length, 1)
        const token = result[0]
        if (token.kind !== "value") {
            return assert.fail()
        }
        assert.equal(token.value, "xxx")
        assert.equal(token.position.line, 1)
        assert.equal(token.position.column, 2)
        assert.equal(errors.length, 0)
        return
    })
    it("stringEscape", () => {
        const errors: ParseError[] = []
        const result = toArray(tokenize(" \n  \"xx\\\"x\"   ", e => errors.push(e), "url"))
        assert.equal(result.length, 1)
        const token = result[0]
        if (token.kind !== "value") {
            return assert.fail()
        }
        assert.equal(token.value, "xx\"x")
        assert.equal(token.position.line, 2)
        assert.equal(token.position.column, 3)
        assert.equal(errors.length, 0)
        return
    })
    it("stringUnicodeEscape", () => {
        const errors: ParseError[] = []
        const result = toArray(tokenize("\"\\u00AE\"", e => errors.push(e), "url"))
        assert.equal(result.length, 1)
        const token = result[0]
        if (token.kind !== "value") {
            return assert.fail()
        }
        assert.equal(token.value, "®")
        assert.equal(token.position.line, 1)
        assert.equal(token.position.column, 1)
        assert.equal(errors.length, 0)
        return
    })
    it("invalidUnicodeEscape", () => {
        const errors: ParseError[] = []
        const result = toArray(tokenize("\"\\u0XAE\"", e => errors.push(e), "someurl.json"))
        assert.equal(result.length, 1)
        const token = result[0]
        if (token.kind !== "value") {
            return assert.fail()
        }
        assert.equal(token.value, "AE")
        assert.equal(token.position.line, 1)
        assert.equal(token.position.column, 1)
        assert.equal(errors.length, 1)
        assert.deepStrictEqual(errors[0].url, "someurl.json")
        return
    })
    it("unexpectedUnicodeEscapeEnd", () => {
        const errors: ParseError[] = []
        const result = toArray(tokenize("\"\\u0", e => errors.push(e), "url"))
        assert.equal(result.length, 1)
        const token = result[0]
        if (token.kind !== "value") {
            return assert.fail()
        }
        assert.equal(token.value, "")
        assert.equal(token.position.line, 1)
        assert.equal(token.position.column, 1)
        assert.equal(errors.length, 2)
        return
    })
    it("symbol", () => {
        const errors: ParseError[] = []
        const result = toArray(tokenize(" \r\n\t  {   ", e => errors.push(e), "url"))
        assert.equal(result.length, 1)
        const token = result[0]
        assert.equal(token.kind, "{")
        assert.equal(token.position.line, 2)
        assert.equal(token.position.column, 4)
        assert.equal(errors.length, 0)
    })
    it("true and false", () => {
        const errors: ParseError[] = []
        const result = toArray(tokenize(" \r\n\n\t   true  false ", e => errors.push(e), "url"))
        assert.equal(result.length, 2)
        const token0 = result[0]
        if (token0.kind !== "value") {
            return assert.fail()
        }
        assert.equal(token0.position.line, 3)
        assert.equal(token0.position.column, 5)
        assert.strictEqual(token0.value, true)
        const token1 = result[1]
        if (token1.kind !== "value") {
            return assert.fail()
        }
        assert.equal(token1.position.line, 3)
        assert.equal(token1.position.column, 11)
        assert.strictEqual(token1.value, false)
        assert.equal(errors.length, 0)
        return
    })
    it("symbol and numbers", () => {
        const errors: ParseError[] = []
        const result = toArray(tokenize("-234,56.78", e => errors.push(e), "url"))
        assert.equal(result.length, 3)
        const token0 = result[0]
        if (token0.kind !== "value") {
            return assert.fail()
        }
        assert.equal(token0.position.line, 1)
        assert.equal(token0.position.column, 1)
        assert.equal(token0.value, -234)
        const token1 = result[1]
        assert.equal(token1.kind, ",")
        assert.equal(token1.position.line, 1)
        assert.equal(token1.position.column, 5)
        const token2 = result[2]
        if (token2.kind !== "value") {
            return assert.fail()
        }
        assert.equal(token2.position.line, 1)
        assert.equal(token2.position.column, 6)
        assert.equal(token2.value, 56.78)
        assert.equal(errors.length, 0)
        return
    })
    it("null and string", () => {
        const errors: ParseError[] = []
        const result = toArray(tokenize("null\"-234\"", e => errors.push(e), "url"))
        assert.equal(result.length, 2)
        const token0 = result[0]
        if (token0.kind !== "value") {
            return assert.fail()
        }
        assert.equal(token0.position.line, 1)
        assert.equal(token0.position.column, 1)
        assert.strictEqual(token0.value, null)
        const token1 = result[1]
        if (token1.kind !== "value") {
            return assert.fail()
        }
        assert.equal(token1.position.line, 1)
        assert.equal(token1.position.column, 5)
        assert.equal(token1.value, "-234")
        assert.equal(errors.length, 0)
        return
    })
    it("invalid number", () => {
        const errors: ParseError[] = []
        const result = toArray(tokenize("-+123e+56", e => errors.push(e), "url"))

        assert.equal(result.length, 1)

        const token0 = result[0]
        if (token0.kind !== "value") {
            return assert.fail()
        }
        assert.equal(token0.position.line, 1)
        assert.equal(token0.position.column, 1)
        assert.equal(token0.value, "-+123e+56")

        assert.equal(errors.length, 1)
        return
    })
    it("control character", () => {
        const errors: ParseError[] = []
        const result = toArray(tokenize("\"\n\"", e => errors.push(e), "url"))

        assert.equal(result.length, 1)

        const token0 = result[0]
        if (token0.kind !== "value") {
            return assert.fail()
        }
        assert.equal(token0.position.line, 1)
        assert.equal(token0.position.column, 1)
        assert.equal(token0.value, "\n")

        assert.equal(errors.length, 1)
        return
    })
    it("invalid escape", () => {
        const errors: ParseError[] = []
        const result = toArray(tokenize("\"\\a\"", e => errors.push(e), "url"))

        assert.equal(result.length, 1)

        const token0 = result[0]
        if (token0.kind !== "value") {
            return assert.fail()
        }
        assert.equal(token0.position.line, 1)
        assert.equal(token0.position.column, 1)
        assert.equal(token0.value, "a")

        assert.equal(errors.length, 1)
        return
    })
    it("end of file", () => {
        const errors: ParseError[] = []
        const result = toArray(tokenize("\"xyz", e => errors.push(e), "url"))

        assert.equal(result.length, 1)

        const token0 = result[0]
        if (token0.kind !== "value") {
            return assert.fail()
        }
        assert.equal(token0.position.line, 1)
        assert.equal(token0.position.column, 1)
        assert.equal(token0.value, "xyz")

        assert.equal(errors.length, 1)
        return
    })
    it("invalid symbol", () => {
        const errors: ParseError[] = []
        toArray(tokenize("*", e => errors.push(e), "url"))
        assert.equal(errors.length, 1)
    })
})

