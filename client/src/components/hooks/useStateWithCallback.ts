import { useEffect, useRef, useState } from 'react';

// this hook works just like useState, but it also allows you to specify
// the callback that will be executed after changing state
/* Example:
    const [counter, setCounter] = useStateWithCallback(0);

    useEffect(() => {
        let timer = setTimeout(() => {
            setCounter(5, () => {
                console.log('I will be logged after changing the state!');
            });
        }, 1000);
    }, []);

    return <h1>{counter}</h1>
*/
const useStateWithCallback = <T>(initialState: T) => {
    const [state, _setState] = useState<T>(initialState);
    const callbackRef = useRef<(() => void) | null>(null);

    const setState = (arg: T, callback?: () => void) => {
        if (callback) {
            callbackRef.current = callback;
        }
        _setState(arg);
    };

    useEffect(() => {
        const cb = callbackRef.current;
        if (cb) cb();
        callbackRef.current = null;
    }, [state]);

    return [state, setState] as [T, typeof setState];
};

export default useStateWithCallback;
