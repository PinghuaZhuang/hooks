import { useCallback } from 'react';

interface KeyInput {
  (callback: (e: any) => void, deps?: any[]): void;
}

const keyMap = {
  enter: 'Enter', // 回车
};

type KeyMap = typeof keyMap;

type KeyInputs = {
  [P in keyof KeyMap]: KeyInput;
};

const useKeyInput: KeyInputs = {} as KeyInputs;

let k: keyof KeyMap;
for (k in keyMap) {
  useKeyInput[k as keyof KeyMap] = function (callback, deps) {
    return useCallback((e: KeyboardEvent) => {
      if (e.code === keyMap[k]) {
        callback(e);
      }
    }, deps ?? []);
  };
}

export default useKeyInput;
