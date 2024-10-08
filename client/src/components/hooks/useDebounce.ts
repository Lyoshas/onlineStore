import { useCallback, useRef, useState } from 'react';

// useDebounce allows you to use a debounce function with the optional leading edge* option
/* What is Leading Edge? With debouncing, the function associated with the event is not executed immediately. Instead, a timer is set for a specified delay period. The leading edge of the debounce operation refers to the immediate execution of the function when the event first occurs, before the delay period starts */

// T denotes what fn accepts as an argument
// V denotes what the specified function returns
function useDebounce<T extends unknown[], V>(
    fn: (...args: T) => V,
    ms: number, // the amount of time, in milliseconds, that must pass after the last invocation of the debounced function before that function is executed
    leadingEdge: boolean = false
): {
    isActionExecuting: boolean; // specifies whether the provided function is executing
    debouncedFunction: (...args: T) => Promise<Awaited<V>>;
    cancelDebouncedExecution: () => void;
} {
    const [isActionExecuting, setIsActionExecuting] = useState<boolean>(false);
    const isFirstCallRef = useRef(true);
    const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

    const cancelDebouncedExecution = useCallback(() => {
        if (timer !== null) {
            clearTimeout(timer);
            setTimer(null);
        }
    }, [timer]);

    const debouncedFunction: (...args: T) => Promise<Awaited<V>> = useCallback(
        (...args: T) => {
            return new Promise((resolve, reject) => {
                cancelDebouncedExecution();

                function runAction() {
                    setIsActionExecuting(true);
                    // calling fn (it's passed in useDebounce)
                    Promise.resolve(fn(...args))
                        .then((result) => {
                            resolve(result);
                        })
                        .catch((err: unknown) => reject(err))
                        .finally(() => setIsActionExecuting(false));
                }

                // if this is the first call and the user set the "leadingEdge" option to "true", then run the action immediately, otherwise delay it
                if (isFirstCallRef.current && leadingEdge) {
                    runAction();
                } else {
                    setTimer(setTimeout(runAction, ms));
                }

                if (isFirstCallRef.current) {
                    // specifying that this is not the first call anymore
                    isFirstCallRef.current = false;
                }
            });
        },
        [fn, cancelDebouncedExecution]
    );

    return { isActionExecuting, debouncedFunction, cancelDebouncedExecution };
}

export default useDebounce;
