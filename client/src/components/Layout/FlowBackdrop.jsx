import { useEffect, useRef } from 'react';
import './layout.css';

const MOTION_QUERY = '(prefers-reduced-motion: reduce)';

const isLowCapacityDevice = () => {
  const memory = navigator?.deviceMemory;
  if (memory && memory < 4) return true;
  const cores = navigator?.hardwareConcurrency;
  if (cores && cores <= 2) return true;
  return false;
};

export default function FlowBackdrop() {
  const rafRef = useRef(0);

  useEffect(() => {
    const root = document.documentElement;
    const motionMedia = window.matchMedia(MOTION_QUERY);

    const resetVars = () => {
      root.style.setProperty('--flow-tilt-x', '0deg');
      root.style.setProperty('--flow-tilt-y', '0deg');
      root.style.setProperty('--flow-shift-x', '0px');
      root.style.setProperty('--flow-shift-y', '0px');
      root.style.setProperty('--flow-depth', '0px');
      root.style.setProperty('--flow-enabled', '0');
    };

    if (motionMedia.matches || isLowCapacityDevice()) {
      resetVars();
      return;
    }

    root.style.setProperty('--flow-enabled', '1');
    const state = {
      targetX: 0,
      targetY: 0,
      currentX: 0,
      currentY: 0,
      scroll: window.scrollY || 0,
      hidden: document.hidden,
    };

    const dampen = 0.08;

    const step = () => {
      state.currentX += (state.targetX - state.currentX) * dampen;
      state.currentY += (state.targetY - state.currentY) * dampen;
      const tiltX = state.currentX * 16;
      const tiltY = state.currentY * 14;
      const shiftX = state.currentX * 18;
      const shiftY = state.currentY * 22 - Math.min(42, state.scroll * 0.08);
      const depth = Math.min(32, Math.abs(tiltX) + Math.abs(tiltY) + state.scroll * 0.02);

      root.style.setProperty('--flow-tilt-x', `${tiltX.toFixed(3)}deg`);
      root.style.setProperty('--flow-tilt-y', `${tiltY.toFixed(3)}deg`);
      root.style.setProperty('--flow-shift-x', `${shiftX.toFixed(3)}px`);
      root.style.setProperty('--flow-shift-y', `${shiftY.toFixed(3)}px`);
      root.style.setProperty('--flow-depth', `${depth.toFixed(3)}px`);

      if (!state.hidden) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    const onPointerMove = (event) => {
      const xRatio = event.clientX / window.innerWidth - 0.5;
      const yRatio = event.clientY / window.innerHeight - 0.5;
      state.targetX = Math.max(-0.6, Math.min(0.6, xRatio));
      state.targetY = Math.max(-0.6, Math.min(0.6, yRatio));
    };

    const onScroll = () => {
      state.scroll = window.scrollY || 0;
    };

    const onVisibilityChange = () => {
      state.hidden = document.hidden;
      if (!state.hidden) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        cancelAnimationFrame(rafRef.current);
      }
    };

    const onMotionChange = (event) => {
      if (event.matches) {
        cleanup();
        resetVars();
      }
    };

    const cleanup = () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      motionMedia.removeEventListener('change', onMotionChange);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);
    motionMedia.addEventListener('change', onMotionChange);

    rafRef.current = requestAnimationFrame(step);

    return () => {
      cleanup();
      resetVars();
    };
  }, []);

  return (
    <div className="flow-backdrop" aria-hidden>
      <div className="flow-veil" />
      <div className="flow-grid" />
    </div>
  );
}
