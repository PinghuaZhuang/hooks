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

let map = new WeakMap();

function fire(target: Target, key: 'resolve' | 'reject', result: any) {
  const { callbacks } = target;
  let i = 0;
  const len = callbacks.length;
  for (; i < len; i++) {
    const callback = callbacks[i][key];
    callback(result);
  }
  target.callbacks = [];
  return result;
}

export default function useDebounceRun<T>(
  fn: (...rest: any[]) => Promise<T>,
  wait: number = 200,
  settings: DebounceSettingsLeading,
) {
  const targetDebunceRun = useMemo(() => {
    if (map.has(fn)) {
      return map.get(fn);
    }
    const run = debounce(
      (...rest) => {
        fn(...rest)
          .then((result) => fire(target, 'resolve', result))
          .catch((error) => fire(target, 'reject', error));
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
        const { run, callbacks } = targetDebunceRun;
        callbacks.push({ resolve, reject });
        run(...rest);
      }),
    [targetDebunceRun],
  );

  return run;
}