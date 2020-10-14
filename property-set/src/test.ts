// tslint:disable:no-magic-numbers

import * as ps from "./index"
// tslint:disable-next-line:no-implicit-dependencies
import { assert } from "chai"

interface A {
    n: number
    s: string
    r?: boolean
    multi: number
    u: true | undefined
}

describe("test", () => {
    it("create", () => {
        const x: A = {
            n: 54,
            s: "",
            multi: 0,
            u: undefined,
        }
        const result = ps.create<A>({
            n: ps.copyProperty(x),
            s: () => "xxx",
            r: () => undefined,
            multi: () => 9,
            u: () => true,
        })
        assert.equal(54, result.n)
        assert.equal("xxx", result.s)
        assert.isUndefined(result.r)
        assert.equal(9, result.multi)
        assert.isTrue(result.u)
    })
    it("copyCreate", () => {
        const source: A = {
            n: 25,
            s: "yyy",
            multi: 19,
            u: true,
        }
        const result = ps.copyCreate(
            source,
            {
                s: () => "xxx",
                r: () => true,
                multi: (v: number, _: "multi") => v + v,
                u: () => undefined,
            })
        assert.equal(25, result.n)
        assert.equal("xxx", result.s)
        assert.isTrue(result.r)
        assert.equal(38, result.multi)
        assert.isUndefined(result.u)
    })
    it("no changes", () => {
        const source: A = {
            n: 25,
            s: "yyy",
            multi: 19,
            u: true,
        }
        const result = ps.copyCreate(
            source,
            {
                s: () => "yyy",
                multi: undefined,
            })
        assert.strictEqual(source, result)
    })
    it("asMutable", () => {
        interface X { readonly a: string; readonly b?: number }
        const x: X = { a: "ee" }
        const mx = ps.asMutable(x)
        mx.a = "hello"
        mx.b = undefined
        assert.strictEqual(mx.a, "hello")
        assert.strictEqual(mx.b, undefined)
    })
})
