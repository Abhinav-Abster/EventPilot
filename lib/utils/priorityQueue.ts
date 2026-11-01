/**
 * A min-priority queue implemented with a binary heap.
 * Supports FIFO tie-breaking for equal priority elements.
 */
export class PriorityQueue<T> {
  private heap: { item: T; seq: number }[] = [];
  private seqCounter = 0;
  private compare: (a: T, b: T) => number;

  constructor(compare: (a: T, b: T) => number) {
    this.compare = compare;
  }

  get size(): number {
    return this.heap.length;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  peek(): T | undefined {
    return this.heap[0]?.item;
  }

  push(item: T): void {
    this.heap.push({ item, seq: this.seqCounter++ });
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): T | undefined {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0].item;
    const bottom = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = bottom;
      this.bubbleDown(0);
    }
    return top;
  }

  private internalCompare(a: { item: T; seq: number }, b: { item: T; seq: number }): number {
    const cmp = this.compare(a.item, b.item);
    if (cmp !== 0) return cmp;
    return a.seq - b.seq;
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.internalCompare(this.heap[index], this.heap[parentIndex]) < 0) {
        this.swap(index, parentIndex);
        index = parentIndex;
      } else {
        break;
      }
    }
  }

  private bubbleDown(index: number): void {
    const length = this.heap.length;
    while (true) {
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;
      let smallest = index;

      if (
        leftChild < length &&
        this.internalCompare(this.heap[leftChild], this.heap[smallest]) < 0
      ) {
        smallest = leftChild;
      }

      if (
        rightChild < length &&
        this.internalCompare(this.heap[rightChild], this.heap[smallest]) < 0
      ) {
        smallest = rightChild;
      }

      if (smallest !== index) {
        this.swap(index, smallest);
        index = smallest;
      } else {
        break;
      }
    }
  }

  private swap(i: number, j: number): void {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }
}
