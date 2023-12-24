import _ from 'lodash';
import React from 'react';

/**
 * Sync state to localStorage on value change
 */
export function useLocalStorage<T = string>(args: {
    key: string;
    // value stored in localStorage is string, it's up to the hook consumer to
    // convert the value into correct type
    getInitValue: (value: string | null) => T,
    stringify?: (value: T) => string
}): [T, React.Dispatch<React.SetStateAction<T>>] {
    const { key, getInitValue, stringify } = args;
    const [valueState, setValueState] = React.useState<T>(
        () => {
            const lsValue = localStorage.getItem(key);
            return getInitValue(lsValue);
        }
    )
    React.useEffect(
        () => {
            const strVal = stringify ? stringify(valueState) : (valueState + '');
            localStorage.setItem(key, strVal);
        },
        [valueState]
    )

    return [valueState, setValueState];
}

// useEffect with empty dependecy array can still be called twice due to React strict mode
// this hook will ensure the effectCallback is only called once
export function useEffectOnce(effectCallback: React.EffectCallback) {
    const calledRef = React.useRef(false);
    React.useEffect(
        () => {
            const called = calledRef.current;
            if (called) {
                return;
            }
            calledRef.current = true;
            return effectCallback();
        },
        []
    )
}