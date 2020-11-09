/* tslint:disable:no-expression-statement readonly-keyword */
import * as _ from "./index";
import * as i from "@azure/openapi-tools-common-iterator";
import "mocha";
import { assert } from "chai";

describe("groupBy", () => {
  it("array", () => {
    const m = i.map(
      [1, 2, 3, 1, 3, 2, 3, 3],
      (x) => [x.toString(), 1 as number] as const
    );
    const result = _.groupBy(m, (a, b) => a + b);
    assert.deepEqual({ 1: 2, 2: 2, 3: 4 }, result);
  });
});

describe("values", () => {
  it("array", () => {
    const result = _.values({ 1: 2, 2: 2, 3: 3 }).toArray();
    assert.deepEqual([2, 2, 3], result);
  });
  it("array with undefined", () => {
    const x: { [name: string]: number | undefined } = {
      1: 2,
      2: 4,
      t: undefined,
    };
    const result = _.values(x).toArray();
    assert.deepEqual([2, 4], result);
  });
});

describe("names", () => {
  it("array", () => {
    const result = _.keys({ 1: 2, 2: 2, 3: 3, 4: undefined }).toArray();
    assert.deepEqual(["1", "2", "3"], result);
  });
});

describe("entry", () => {
  it("destruction", () => {
    const r: _.Entry<number> = ["aaa", 54];
    const [a, b] = r;
    assert.equal("aaa", a);
    assert.equal(54, b);
  });
});

describe("allKeys", () => {
  it("undefined", () => {
    const x = _.allKeys(undefined).toArray();
    assert.strictEqual(x.length, 0);
  });
});

describe("entries", () => {
  it("array", () => {
    const x: { [name: string]: number } = { 1: 2, 2: 2, 3: 3 };
    const result = _.entries(x).toArray();
    assert.deepEqual(
      [
        ["1", 2],
        ["2", 2],
        ["3", 3],
      ] as const,
      result
    );
  });
  it("array with undefined", () => {
    const x: { [name: string]: number | undefined } = {
      1: 2,
      2: 2,
      t: undefined,
    };
    const result = _.entries(x).toArray();
    assert.deepEqual(
      [
        ["1", 2],
        ["2", 2],
      ] as const,
      result
    );
  });
  it("undefined", () => {
    const x = _.entries(undefined).toArray();
    assert.strictEqual(x.length, 0);
  });
});

describe("stringMap", () => {
  it("stringMap", () => {
    const result = _.stringMap([
      ["a", 2],
      ["b", 4],
    ]);
    assert.deepEqual({ a: 2, b: 4 }, result);
  });
  it("stringMap duplicate", () => {
    const result = _.stringMap([
      ["a", 2],
      ["b", 4],
      ["a", 3],
    ]);
    assert.deepEqual({ a: 3, b: 4 }, result);
  });
});

describe("toStringMap", () => {
  it("toStringMap", () => {
    const r = { a: 4, b: "ww" };
    const v = _.toStringMap(r);
    assert.strictEqual(r, v);
  });
  it("optional", () => {
    interface X {
      a?: 4;
    }
    const r: X = { a: 4 };
    const v = _.toStringMap(r);
    assert.strictEqual(r, v);
  });
});

describe("map", () => {
  it("map", () => {
    const x = { a: 3, b: 4 };
    const result = _.map(x, (a) => a * a);
    assert.deepEqual({ a: 9, b: 16 }, result);
  });
});

describe("isEqual", () => {
  it("equal", () => {
    assert.isTrue(_.isEqual({ a: 3, b: 4 }, { a: 3, b: 4 }));
    assert.isTrue(_.isEqual({}, {}));
  });
  it("not equal", () => {
    assert.isFalse(_.isEqual({ a: 3, b: 4 }, { a: 3, b: "3" }));
    assert.isFalse(_.isEqual({ a: 3, b: 4 }, { a: 3 }));
    assert.isFalse(_.isEqual({}, { a: 3 }));
  });
});

describe("merge", () => {
  it("two", () => {
    const a = { a: "Hello" };
    const b = { b: "world!" };
    const r = _.merge(a, b);
    assert.deepEqual({ a: "Hello", b: "world!" }, r);
  });
  it("three with collision", () => {
    const a = { a: "Hello" };
    const b = { b: "world!" };
    const c = { a: "no", c: "X" };
    const r = _.merge(a, b, c);
    assert.deepEqual({ a: "no", b: "world!", c: "X" }, r);
  });
  it("empty", () => {
    const r = _.merge();
    assert.deepEqual({}, r);
  });
  it("merge undefined", () => {
    const r = _.merge({ a: "5" }, undefined, { b: "6" });
    assert.deepEqual({ a: "5", b: "6" }, r);
  });
});

describe("isEmpty", () => {
  it("empty", () => {
    const r = _.isEmpty({});
    assert.isTrue(r);
  });
  it("not empty", () => {
    const r = _.isEmpty({ a: 45 });
    assert.isFalse(r);
  });
});
