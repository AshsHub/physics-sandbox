import type { IEventMap } from "../events/EventMap";

export interface IEventBus {
  emit<K extends keyof IEventMap>(event: K, payload: IEventMap[K]): void;
  subscribe<K extends keyof IEventMap>(
    event: K,
    listener: (payload: IEventMap[K]) => void,
  ): () => void;
}
