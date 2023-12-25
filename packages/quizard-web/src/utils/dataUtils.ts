import _ from 'lodash';

// utilities for handle unknown data types

export function isDefined<T>(value: T | undefined | null): value is T {
    return value !== undefined && value !== null;
}

// try to restore array from an unknown data source
// if itemRestore return null | undefined, the value will be discarded
// if strict=true, will discard if length of restored data is different than old data
export const restoreArr = <T>(args: {
    value: unknown;
    itemRestore: (item: unknown, index: number) => T | null | undefined;
    strict?: boolean;
}): null | T[] => {
    const { value, itemRestore, strict } = args;

    if (_.isArray(value)) {
        const items = value.map((item, index) => itemRestore(item, index)).filter(isDefined);
        if (strict && items.length !== value.length) {
            return null;
        }
        return items;
    } else {
        if (strict) {
            return null;
        }
        const item = itemRestore(value, 0);
        if (item) {
            return [item];
        }
    }
    return null;
};

type Obj = Record<string, unknown>;
export const hasObjField = <T extends string>(val: unknown, key: T): val is Record<T, Obj> => {
    if (!isObj(val)) {
        return false;
    }
    return isObj(val[key + '']);
};

export const hasStrField = <T extends string>(val: unknown, key: T): val is Record<T, string> => {
    if (!isObj(val)) {
        return false;
    }
    return typeof val[key + ''] === 'string';
};

export const hasNumField = <T extends string>(val: unknown, key: T): val is Record<T, number> => {
    if (!isObj(val)) {
        return false;
    }
    return typeof val[key + ''] === 'number';
};

export const hasBoolField = <T extends string>(val: unknown, key: T): val is Record<T, boolean> => {
    if (!isObj(val)) {
        return false;
    }
    return typeof val[key + ''] === 'boolean';
};

export const isObj = (val: unknown): val is Obj => {
    return _.isObject(val);
};

/**
 * When access array item, it could be out of bound
 * e.g: 
 *  x = [1,2,3,4]
 *  y = x[4] // undefined
 * However, typescript cannot catch this and infer y as number instead of number | undefined.
 * Use this function to cast the type of y to number | undefined
 */
export function maybe<T>(value: T): T | undefined { return value; }