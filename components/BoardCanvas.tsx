'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Excalidraw, serializeAsJSON } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface BoardCanvasProps {
  /** 已保存的场景 JSON（serializeAsJSON 的输出）；新画板为 null */
  initialSceneJson?: string | null;
  /** 只读模式：非本人访客只能看，不能改 */
  readOnly: boolean;
  /** 保存回调，接收序列化后的场景 JSON 字符串 */
  onSave?: (sceneJson: string) => Promise<void>;
  /** 保存状态上报给父组件（由页面顶栏展示，避免与 Excalidraw 自带 UI 重叠） */
  onStatusChange?: (status: SaveStatus) => void;
  /** 「立即保存」信号：每次递增触发一次立刻保存 */
  flushSignal?: number;
}

/**
 * Excalidraw 画布封装。仅在 ssr:false 下被动态加载（内部直接静态引入 Excalidraw）。
 * 本人可编辑并自动保存（改动停止 1.5s 后落库）；访客只读。
 * 保存状态不在画布内展示，而是通过 onStatusChange 上报，交由页面顶栏渲染。
 */
export default function BoardCanvas({
  initialSceneJson,
  readOnly,
  onSave,
  onStatusChange,
  flushSignal,
}: BoardCanvasProps) {
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 保存最近一次的场景，供防抖回调与手动保存共用
  const latest = useRef<string | null>(initialSceneJson ?? null);

  const initialData = useMemo(() => {
    if (!initialSceneJson) return undefined;
    try {
      const parsed = JSON.parse(initialSceneJson);
      return { elements: parsed.elements ?? [], appState: parsed.appState ?? {}, files: parsed.files ?? {} };
    } catch {
      return undefined;
    }
  }, [initialSceneJson]);

  const doSave = useCallback(async () => {
    if (!onSave || latest.current == null) return;
    onStatusChange?.('saving');
    try {
      await onSave(latest.current);
      onStatusChange?.('saved');
    } catch {
      onStatusChange?.('error');
    }
  }, [onSave, onStatusChange]);

  const handleChange = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (elements: readonly any[], appState: any, files: any) => {
      if (readOnly || !onSave) return;
      latest.current = serializeAsJSON(elements, appState, files, 'local');
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(doSave, 1500);
    },
    [readOnly, onSave, doSave]
  );

  // 父组件递增 flushSignal 时立即保存一次。
  // 用 ref 记录上次值：仅在信号「变化」时保存，避免（含切换画板重新挂载后）在挂载时误触发。
  const flushRef = useRef(flushSignal);
  useEffect(() => {
    if (flushSignal !== flushRef.current) {
      flushRef.current = flushSignal;
      doSave();
    }
    // 仅跟随 flushSignal 变化
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flushSignal]);

  return (
    <div className="relative w-full h-full">
      <Excalidraw
        initialData={initialData}
        viewModeEnabled={readOnly}
        onChange={handleChange}
        theme="dark"
        langCode="zh-CN"
      />
    </div>
  );
}
