import { useCallback, useState } from 'react';

let lastCall: number;

// in this case useDebounce allows you to use a debounce function with the leading edge
// T denotes what fn accepts as an argument
// V denotes what the async function returns
// (!) - fn must return a promise
function useDebounce<T extends any[], V>(
    fn: (...args: T) => Promise<V>,
    ms: number
): {
    isActionExecuting: boolean;
    debouncedFunction: (...args: T) => Promise<V>;
} {
    const [isActionExecuting, setIsActionExecuting] = useState<boolean>(false);

    let timer: ReturnType<typeof setTimeout>;

    const debouncedFunction: (...args: T) => Promise<V> = useCallback(
        (...args: T) => {
            return new Promise((resolve, reject) => {
                clearTimeout(timer);

                function runAction() {
                    setIsActionExecuting(true);
                    // calling fn (it's passed in useDebounce)
                    fn(...args)
                        .then((result: V) => {
                            lastCall = Date.now();
                            resolve(result);
                        })
                        .catch((err: unknown) => reject(err))
                        .finally(() => setIsActionExecuting(false));
                }

                // if lastCall is not defined (if it's the first time) or if the specified time has passed
                if (lastCall == null || Date.now() - lastCall > ms) {
                    runAction();
                } else {
                    timer = setTimeout(runAction, ms);
                }
            });
        },
        [fn]
    );

    return { isActionExecuting, debouncedFunction };
}

export default useDebounce;
