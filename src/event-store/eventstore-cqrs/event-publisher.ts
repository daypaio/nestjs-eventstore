import { Injectable } from '@nestjs/common';
import { AggregateRoot, IEvent } from '@nestjs/cqrs';
import { EventBusProvider } from './event-bus.provider';
import { IAggregateEvent } from '../shared/aggregate-event.interface';

export interface Constructor<T> {
  new(...args: any[]): T;
}

@Injectable()
export class EventPublisher {
  constructor(private readonly eventBus: EventBusProvider) { }

  mergeClassContext<T extends Constructor<AggregateRoot>>(metatype: T): T {
    const eventBus = this.eventBus;
    return class extends metatype {
      publish(event: IEvent) {
        eventBus.publish(event, (event as IAggregateEvent).streamName);
      }
    };
  }

  mergeObjectContext<T extends AggregateRoot>(object: T): T {
    const eventBus = this.eventBus;
    object.publish = (event: IEvent) => {
      eventBus.publish(event, (event as IAggregateEvent).streamName);
    };
    return object;
  }
}
