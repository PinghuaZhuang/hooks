/**
 * Promise 防抖. 返回一个Promise.
 */
import { useMemo, useCallback } from 'react';
import { debounce } from 'lodash';
import type { DebounceSettingsLeading, DebouncedFuncLeading } from 'lodash';

type Callbacks = {
  resolve: (rest: any) => void;
  reject: (error: any) => void;
}[];
type Target = {
  run: DebouncedFuncLeading<(...rest: any) => void>;
  callbacks: Callbacks;
};

const map = new WeakMap();

function fire(callbacks: Callbacks, key: 'resolve' | 'reject', result: any) {
  let i = 0;
  const len = callbacks.length;
  for (; i < len; i++) {
    const callback = callbacks[i][key];
    callback(result);
  }
  return result;
}

useDebounceRun.map = map;

export default function useDebounceRun<T>(
  fn: (...rest: any[]) => Promise<T>,
  wait = 200,
  settings: DebounceSettingsLeading,
) {
  const targetDebunceRun = useMemo(() => {
    if (map.has(fn)) {
      return map.get(fn);
    }
    const run = debounce(
      (...rest) => {
        const callbacks = target.callbacks;
        target.callbacks = [];
        fn(...rest)
          .then((result) => fire(callbacks, 'resolve', result))
          .catch((error) => fire(callbacks, 'reject', error));
      },
      wait,
      settings,
    );
    const target: Target = {
      run,
      callbacks: [] as Callbacks,
    };
    map.set(fn, target);
    return target;
  }, [fn]);

  const run = useCallback(
    (...rest: any[]) =>
      new Promise((resolve, reject) => {
        const { run: invoke, callbacks } = targetDebunceRun;
        callbacks.push({ resolve, reject });
        invoke(...rest);
      }),
    [targetDebunceRun],
  );

  return run;
}
