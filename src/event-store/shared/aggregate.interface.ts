import { IEvent } from '@nestjs/cqrs';

export interface IAggregate extends IEvent {
  streamName: string;
}
