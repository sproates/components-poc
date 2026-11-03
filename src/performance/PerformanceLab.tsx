import { useEffect, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { Button } from "../atoms/Button";

export interface PerformanceController {
  mount(count: number): Promise<void>;
  unmount(): Promise<void>;
}

declare global {
  interface Window {
    componentPerf?: PerformanceController;
  }
}

const afterPaintOpportunity = () => new Promise<void>((resolve) => {
  requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
});

/** Kept out of library exports: the controller exists only in benchmark stories. */
export function PerformanceLab({ renderSubjects }: { renderSubjects: (count: number) => ReactNode }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const controller: PerformanceController = {
      async mount(nextCount) {
        if (!Number.isInteger(nextCount) || nextCount < 1 || nextCount > 500) {
          throw new Error("Benchmark count must be an integer between 1 and 500");
        }
        flushSync(() => setCount(nextCount));
        await afterPaintOpportunity();
      },
      async unmount() {
        flushSync(() => setCount(0));
        await afterPaintOpportunity();
      }
    };
    window.componentPerf = controller;
    return () => { if (window.componentPerf === controller) delete window.componentPerf; };
  }, []);

  return (
    <section aria-label="Component benchmark">
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20 }}>
        <Button onClick={() => window.componentPerf?.mount(1)}>Mount 1</Button>
        <Button onClick={() => window.componentPerf?.mount(100)}>Mount 100</Button>
        <Button variant="secondary" onClick={() => window.componentPerf?.unmount()}>Unmount</Button>
        <output aria-label="Mounted instances">{count}</output>
      </div>
      <div className="ds-perf-grid" data-benchmark-subjects="">
        {count > 0 ? renderSubjects(count) : null}
      </div>
    </section>
  );
}
