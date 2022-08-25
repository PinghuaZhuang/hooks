/**
 * @file 表格自适应
 * @description
 *    1. 容器(classname对应的DOM)必须是自适应的
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import debounce from 'lodash/debounce';

type Scroll = {
  y: null | number;
  x: true;
};

function isEmptyString(str: any) {
  if (typeof str !== 'string') return true;
  return str.trim() === '';
}

const calcTableLayout = debounce(
  (
    eleRef: any,
    setScroll: React.Dispatch<React.SetStateAction<Scroll>>,
    interpolation: number,
    isResize: boolean,
  ) => {
    const { container, containerWidth } = eleRef.current;
    // 表格的内部可能还没有渲染出来, 需要实时获取
    const tableHead = container.querySelector(`.ant-table-thead`);
    const tableBody = container.querySelector(`tbody.ant-table-tbody`);

    if (isResize && container) {
      container.style.width = containerWidth;
    }

    // 计算表格高度
    const { height = 0, width } = container?.getBoundingClientRect() ?? {};
    const { height: tableHeadHeight = 60 } =
      tableHead?.getBoundingClientRect() ?? {};
    let y: Scroll['y'] = height - tableHeadHeight - interpolation;
    y = tableBody.scrollHeight > y ? y : null;

    if (container && isEmptyString(container.style.width)) {
      // FIXED: 修复无限变长的问题. 也可以设置 width: calc(...)
      container.style.width = `${width}px`;
    }

    if (y !== eleRef.current.scroll.y) {
      setScroll({ y, x: true });
    }
  },
  200,
);

// 根据表格容器自适应
export default function useAdaptionTableScroll(
  className: string,
  resizeable = true,
  interpolation = 0,
) {
  if (className == null) {
    return console.error(`❌ useScroll必须传入className.`, className);
  }
  className = className.replace(/\.?([A-Za-z0-9_-]+)/g, '.$1');
  const [scroll, setScroll] = useState<Scroll>({
    y: null,
    x: true,
  });
  const eleRef = useRef<any>({});

  const onResize = useCallback(
    () => calcTableLayout(eleRef, setScroll, interpolation, true),
    [],
  );

  useEffect(() => {
    eleRef.current.scroll = scroll;
  }, [scroll]);

  useEffect(() => {
    const container: HTMLElement | null = document.querySelector(className);
    if (container == null) {
      return console.error(`❌ useScroll没有找到容器. className必须使用类名.`);
    }

    eleRef.current = {
      container,
      scroll,
      containerWidth: container.style.width,
    };
    // 监听父容器变化
    let ob: ResizeObserver;
    if (resizeable && container.parentElement) {
      ob = new ResizeObserver(onResize);
      ob.observe(container.parentElement);
      ob.observe(container.querySelector(`.ant-table`) as HTMLElement);
    }

    onResize();

    return () => {
      clearTimeout(eleRef.current.timer as number);
      ob?.disconnect();
    };
  }, []);

  return scroll;
}
