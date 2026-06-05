// src/events/EventMap.ts

export interface IEventMap {
  sandboxObjectCreated: {
    id: string;
  };

  sandboxObjectDestroyed: {
    id: string;
  };

  sandboxObjectChanged: {
    id: string;
  };
}
