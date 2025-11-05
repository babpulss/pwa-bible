// Minimal ambient types for the Screen Wake Lock API
// See: https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API

interface WakeLock {
  request(type: "screen"): Promise<WakeLockSentinel>;
}

interface WakeLockSentinel extends EventTarget {
  released: boolean;
  type: "screen";
  release(): Promise<void>;
  onrelease: ((this: WakeLockSentinel, ev: Event) => void) | null;
}

interface Navigator {
  wakeLock?: WakeLock;
}

declare const WakeLockSentinel: {
  prototype: WakeLockSentinel;
};
