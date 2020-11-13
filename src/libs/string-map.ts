import * as _ from "./iterator";

export const enum EntryIndex {
  Key = 0,
  Value = 1,
}

export type MapEntry<T> = readonly [string, T];

// export const entry: <T>(key: string, value: T) => Entry<T> = tuple2

export const entryKey = <T>(e: MapEntry<T>): string => e[EntryIndex.Key];

export const entryValue = <T>(e: MapEntry<T>): T => e[EntryIndex.Value];

export type PartialStringMap<K extends string, V> = {
  readonly [k in K]?: V;
};

export interface StringMap<T> {
  readonly [k: string]: T | undefined;
}

export const toStringMap = <K extends string, V>(
  v: PartialStringMap<K, V>
): StringMap<V> => v;

export interface MutableStringMap<T> {
  // tslint:disable-next-line:readonly-keyword
  [key: string]: T | undefined;
}

export type StringMapItem<T> = T extends StringMap<infer I> ? I : never;

export const allKeys = <T>(
  input: StringMap<T> | undefined | null
): _.IterableEx<string> => objectAllKeys<string, T>(input);

export const objectAllKeys = <K extends string, T>(
  input: PartialStringMap<K, T> | undefined | null
): _.IterableEx<K> =>
  _.iterable(function* (): Iterator<K> {
    // tslint:disable-next-line:no-if-statement
    if (input === undefined || input === null) {
      return;
    }
    // tslint:disable-next-line:no-loop-statement
    for (const key in input) {
      yield key;
    }
  });

export const mapEntries = <T>(
  input: StringMap<T> | undefined | null
): _.IterableEx<MapEntry<T>> => objectEntries<string, T>(input);

export const objectEntries = <K extends string, T>(
  input: PartialStringMap<K, T> | undefined | null
): _.IterableEx<readonly [K, T]> => {
  // tslint:disable-next-line:no-if-statement
  if (input === undefined || input === null) {
    return _.empty();
  }
  return objectAllKeys(input).filterMap((key) => {
    const value = input[key];
    return value !== undefined ? ([key, value as T] as const) : undefined;
  });
};

export const keys = <T>(
  input: StringMap<T> | undefined | null
): _.IterableEx<string> => mapEntries(input).map(entryKey);

export const values = <T>(
  input: StringMap<T> | undefined | null
): _.IterableEx<T> => mapEntries(input).map(entryValue);

export const groupBy = <T>(
  input: Iterable<MapEntry<T>>,
  reduceFunc: (a: T, b: T) => T
): StringMap<T> => {
  /* tslint:disable-next-line:readonly-keyword */
  const result: MutableStringMap<T> = {};
  _.forEach(input, ([key, value]) => {
    const prior = result[key];
    /* tslint:disable-next-line:no-object-mutation no-expression-statement */
    result[key] = prior === undefined ? value : reduceFunc(prior, value);
  });
  return result;
};

export const stringMap = <T>(input: Iterable<MapEntry<T>>): StringMap<T> =>
  // tslint:disable-next-line:variable-name
  groupBy(input, (_a, b) => b);

export const buildMap = <S, R>(
  source: StringMap<S>,
  f: (v: S, k: string) => R
): StringMap<R> =>
  stringMap(mapEntries(source).map(([k, v]) => [k, f(v, k)] as const));

export const merge = <T>(
  ...a: readonly (StringMap<T> | undefined)[]
): StringMap<T> => stringMap(_.map(a, mapEntries).flatMap((v) => v));

// Performs a partial deep comparison between object and source to determine if object contains
// equivalent property values.
// See also https://lodash.com/docs/4.17.10#isMatch
export const isMatch = <O, S>(
  object: StringMap<O>,
  source: StringMap<S>
): boolean =>
mapEntries(source).every(([key, value]) => _.isStrictEqual(object[key], value));

export const isMapEqual = <A, B>(a: StringMap<A>, b: StringMap<B>): boolean =>
  _.isStrictEqual(a, b) || (isMatch(a, b) && isMatch(b, a));

export const isMapEmpty = <T>(a: StringMap<T>): boolean => mapEntries(a).isEmpty();
