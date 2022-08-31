type Fn = (...rest: any[]) => any;

/**
 * 简易的队列
 * @description 当且仅当返回 false 的时候拦截.
 */
class Callbacks {
  callbacks: Fn[] = [];

  on(fn: Fn) {
    this.callbacks.push(fn);
  }

  off(fn: Fn) {
    const index = this.callbacks.findIndex((o) => o === fn);
    if (index !== -1) {
      this.callbacks.splice(index, 1);
    }
  }

  fire(...rest: any[]) {
    let i = 0;
    const length = this.callbacks.length;
    for (; i < length; i++) {
      const fn = this.callbacks[i];
      if (typeof fn === 'function' && fn(...rest) === false) {
        // 终止
        return;
      }
    }
  }

  clean() {
    this.callbacks = [];
  }
}

export default Callbacks;
