import type { IEventBus } from "../abstractions/IEventBus";
import type { IEventMap } from "../events/EventMap";

type EventListener<T> = (payload: T) => void;

export class EventBus implements IEventBus {
  private readonly listeners = new Map<
    keyof IEventMap,
    Set<EventListener<unknown>>
  >();

  public emit<K extends keyof IEventMap>(
    event: K,
    payload: IEventMap[K],
  ): void {
    const listeners = this.listeners.get(event);

    if (!listeners) {
      return;
    }

    listeners.forEach((listener) => {
      (listener as EventListener<IEventMap[K]>)(payload);
    });
  }

  public subscribe<K extends keyof IEventMap>(
    event: K,
    listener: EventListener<IEventMap[K]>,
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    const listeners = this.listeners.get(event)!;

    listeners.add(listener as EventListener<unknown>);

    return () => {
      listeners.delete(listener as EventListener<unknown>);
    };
  }
}
