// tslint:disable:no-null-keyword
// tslint:disable:no-magic-numbers

import * as assert from "assert"
import * as index from "../index"

describe("isObject", () => {
  it("object", () => {
    const x = {}
    assert.strictEqual(index.isObject(x), true)
  })
  it("array", () => {
    const x: index.Json[] = []
    assert.strictEqual(index.isObject(x), false)
  })
  it("primitive", () => {
    const x = 5
    assert.strictEqual(index.isObject(x), false)
  })
  it("null", () => {
    const x = null
    assert.strictEqual(index.isObject(x), false)
  })
})

describe("isPrimitive", () => {
  it("primitive", () => {
    const x = 5
    assert.strictEqual(index.isPrimitive(x), true)
  })
  it("null", () => {
    const x = null
    assert.strictEqual(index.isPrimitive(x), true)
  })
  it("not primitive", () => {
    const x = {}
    assert.strictEqual(index.isPrimitive(x), false)
  })
})

describe("visit", () => {
  it("string", () => {
    const x = "str"
    index.visit(x, {
      asNull: () => { assert.fail() },
      asBoolean: () => { assert.fail() },
      asString: (v) => { assert.strictEqual(v, "str") },
      asNumber: () => { assert.fail() },
      asArray: () => { assert.fail() },
      asObject: () => { assert.fail() },
    })
  })
  it("null", () => {
    const x = null
    index.visit(x, {
      asNull: () => { },
      asBoolean: () => { assert.fail() },
      asString: () => { assert.fail() },
      asNumber: () => { assert.fail() },
      asArray: () => { assert.fail() },
      asObject: () => { assert.fail() },
    })
  })
  it("boolean", () => {
    const x = true
    index.visit(x, {
      asNull: () => { assert.fail() },
      asBoolean: v => { assert.strictEqual(v, true) },
      asString: () => { assert.fail() },
      asNumber: () => { assert.fail() },
      asArray: () => { assert.fail() },
      asObject: () => { assert.fail() },
    })
  })
  it("number", () => {
    const x = 5
    index.visit(x, {
      asNull: () => { assert.fail() },
      asBoolean: () => { assert.fail() },
      asString: () => { assert.fail() },
      asNumber: v => { assert.strictEqual(v, 5) },
      asArray: () => { assert.fail() },
      asObject: () => { assert.fail() },
    })
  })
  it("array", () => {
    const x = [76]
    index.visit(x, {
      asNull: () => { assert.fail() },
      asBoolean: () => { assert.fail() },
      asString: () => { assert.fail() },
      asNumber: () => { assert.fail() },
      asArray: v => { assert.deepStrictEqual(v, [76]) },
      asObject: () => { assert.fail() },
    })
  })
  it("object", () => {
    const x = {}
    index.visit(x, {
      asNull: () => { assert.fail() },
      asBoolean: () => { assert.fail() },
      asString: () => { assert.fail() },
      asNumber: () => { assert.fail() },
      asArray: () => { assert.fail() },
      asObject: v => { assert.deepStrictEqual(v, {}) },
    })
  })
})

describe("typeOf", () => {
  it("object", () => {
    const x = {}
    assert.strictEqual(index.typeOf(x), "object")
  })
  it("null", () => {
    assert.strictEqual(index.typeOf(null), "null")
  })
  it("string", () => {
    assert.strictEqual(index.typeOf("ssss"), "string")
  })
  it("number", () => {
    assert.strictEqual(index.typeOf(4), "number")
  })
  it("boolean", () => {
    assert.strictEqual(index.typeOf(false), "boolean")
  })
  it("array", () => {
    assert.strictEqual(index.typeOf([]), "array")
  })
})

describe("sealed object", () => {
  // tslint:disable-next-line:completed-docs
  interface X { a: number }
  const x: X & index.EmptyObject = { a: 54 }
  const j: index.Json = x as unknown as index.Json
  assert.deepStrictEqual(j, { a: 54 })
})
