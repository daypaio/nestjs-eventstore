export * from './event-store/event-store.module';
export * from './event-store/event-store.bus';
export * from './event-store/event-store.class';
export * from './event-store/event-bus.provider';

export function getHello(): string {
  return 'Buon Giorno!';
}
