import type { AgencyEvent, EventType } from "./types.js";

export type EventHandler<T = unknown> = (event: AgencyEvent<T>) => Promise<void> | void;

export class EventBus {
  private readonly handlers = new Map<EventType, Set<EventHandler>>();

  on(type: EventType, handler: EventHandler): void {
    const set = this.handlers.get(type) ?? new Set<EventHandler>();
    set.add(handler);
    this.handlers.set(type, set);
  }

  async publish<T>(event: AgencyEvent<T>): Promise<void> {
    for (const handler of this.handlers.get(event.type) ?? []) await handler(event);
  }
}