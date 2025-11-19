export {};

declare global {
  interface HighlightRegistry extends Iterable<[string, Highlight]> {
    size: number;
    get(name: string): Highlight | undefined;
    set(name: string, value: Highlight): HighlightRegistry;
    delete(name: string): boolean;
    clear(): void;
    keys(): IterableIterator<string>;
    values(): IterableIterator<Highlight>;
    entries(): IterableIterator<[string, Highlight]>;
    forEach(
      callback: (value: Highlight, key: string, parent: HighlightRegistry) => void,
      thisArg?: unknown
    ): void;
    [Symbol.iterator](): IterableIterator<[string, Highlight]>;
  }

  interface Highlight extends Set<Range> {}

  // Highlight constructor
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  var Highlight: {
    prototype: Highlight;
    new (...ranges: Range[]): Highlight;
  };

  interface CSS {
    highlights?: HighlightRegistry;
  }

  interface Window {
    Highlight?: typeof Highlight;
  }
}
