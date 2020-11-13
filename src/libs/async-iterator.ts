import * as sync from "./iterator"

export type AsyncEntry<T> = sync.Entry<T>

export type AsyncIterableEx<T> = {
  readonly fold: <A>(func: (a: A, b: T, i: number) => Promise<A> | A, init: A) => Promise<A>
  readonly toArray: () => Promise<readonly T[]>
  readonly entries: () => AsyncIterableEx<AsyncEntry<T>>
  readonly map: <R>(func: (v: T, i: number) => Promise<R> | R) => AsyncIterableEx<R>
  readonly flatMap: <R>(func: (v: T, i: number) => AsyncIterable<R>) => AsyncIterableEx<R>
  readonly filter: (func: (v: T, i: number) => Promise<boolean> | boolean) => AsyncIterableEx<T>
} & AsyncIterable<T>

export const asyncIterable = <T>(createIterator: () => AsyncIterator<T>): AsyncIterableEx<T> => {
  const property = <P extends readonly unknown[], R>(f: (self: AsyncIterable<T>, ...p: P) => R) =>
    (...p: P) => f(result, ...p)
  const result: AsyncIterableEx<T> = {
    [Symbol.asyncIterator]: createIterator,
    fold: property(asyncFold),
    toArray: property(asyncToArray),
    entries: property(asyncEntries),
    map: property(asyncMap),
    flatMap: property(asyncFlatMap),
    filter: property(asyncFilter),
  }
  return result
}

export const asyncFromSync = <T>(input: Iterable<T>): AsyncIterableEx<T> =>
  asyncIterable(async function *(): AsyncIterator<T> { yield *input })

export const asyncFromSequence = <T>(...a: readonly T[]): AsyncIterableEx<T> => asyncFromSync(a)

export const asyncFromPromise = <T>(p: Promise<Iterable<T>>): AsyncIterableEx<T> =>
  asyncIterable(async function *(): AsyncIterator<T> { yield *await p })

export const asyncFold = async <T, A>(
  input: AsyncIterable<T> | undefined,
  func: (a: A, b: T, i: number) => A | Promise<A>,
  init: A,
): Promise<A> => {
  // tslint:disable-next-line:no-let
  let result: A = init
  /* tslint:disable-next-line:no-loop-statement */
  for await (const [index, value] of asyncEntries(input)) {
    /* tslint:disable-next-line:no-expression-statement */
    result = await func(result, value, index)
  }
  return result
}

export const asyncToArray = <T>(input: AsyncIterable<T> | undefined): Promise<readonly T[]> =>
  asyncFold(
    input,
    (a, i) => [...a, i],
    new Array<T>()
  )

export const asyncEntries = <T>(input: AsyncIterable<T> | undefined): AsyncIterableEx<AsyncEntry<T>> =>
  asyncIterable(async function *(): AsyncIterator<sync.Entry<T>> {
    // tslint:disable-next-line:no-if-statement
    if (input === undefined) {
      return
    }
    // tslint:disable-next-line:no-let
    let index = 0
    // tslint:disable-next-line:no-loop-statement
    for await (const value of input) {
      yield [index, value]
      // tslint:disable-next-line:no-expression-statement
      index += 1
    }
  })

export const asyncMap = <T, I>(
  input: AsyncIterable<I> | undefined,
  func: (v: I, i: number) => Promise<T> | T,
): AsyncIterableEx<T> =>
  asyncIterable(async function *(): AsyncIterator<T> {
    /* tslint:disable-next-line:no-loop-statement */
    for await (const [index, value] of asyncEntries(input)) {
      yield func(value, index)
    }
  })

export const asyncFlatten = <T>(input: AsyncIterable<AsyncIterable<T> | undefined> | undefined): AsyncIterableEx<T> =>
  asyncIterable(async function *(): AsyncIterator<T> {
    // tslint:disable-next-line:no-if-statement
    if (input === undefined) {
      return
    }
    // tslint:disable-next-line:no-loop-statement
    for await (const v of input) {
      // tslint:disable-next-line:no-if-statement
      if (v !== undefined) {
        yield *v
      }
    }
  })

export const asyncFlatMap = <T, I>(
  input: AsyncIterable<I> | undefined,
  func: (v: I, i: number) => AsyncIterable<T> | undefined,
): AsyncIterableEx<T> =>
    asyncFlatten(asyncMap(input, func))

// tslint:disable-next-line:no-empty
export const asyncEmpty = <T>(): AsyncIterableEx<T> => asyncIterable(async function *(): AsyncIterator<T> {})

export const asyncFilter = <T>(
  input: AsyncIterable<T> | undefined,
  func: (v: T, i: number) => Promise<boolean> | boolean
): AsyncIterableEx<T> =>
asyncFlatMap(
    input,
    (v, i) => asyncIterable<T>(async function *() {
      // tslint:disable-next-line:no-if-statement
      if (await func(v, i)) {
        yield v
      }
    })
  )
