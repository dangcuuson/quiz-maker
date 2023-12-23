import _ from 'lodash';
import React from 'react';

export function useLocalStorage<T = string>(args: {
    key: string;
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