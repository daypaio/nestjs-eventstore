import { IEvent } from '@nestjs/cqrs';

export interface IAggregateEvent extends IEvent {
  streamName: string;
}
