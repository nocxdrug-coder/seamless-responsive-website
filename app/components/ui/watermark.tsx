/**
 * Watermark overlay — rendered only on routes that display sensitive data.
 * Purely visual deterrent; pointer-events:none so it never blocks clicks.
 */
export function Watermark({ text = "Heaven Card" }: { text?: string }) {
  return (
    <div className="watermark" aria-hidden="true">
      {text}
    </div>
  );
}
