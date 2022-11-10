import { Injectable } from '@nestjs/common';
import { AggregateRoot } from '@nestjs/cqrs';
import { EventBusProvider } from './event-bus.provider';
import { IAggregateEvent } from '../shared/aggregate-event.interface';

export interface Constructor<T> {
  new(...args: any[]): T;
}

@Injectable()
export class EventPublisher {
  constructor(private readonly eventBus: EventBusProvider) { }

  mergeClassContext<T extends Constructor<AggregateRoot<IAggregateEvent>>>(metatype: T): T {
    const eventBus = this.eventBus;
    return class extends metatype {
      publish(event: IAggregateEvent) {
        eventBus.publish(event, event.streamName);
      }
    };
  }

  mergeObjectContext<T extends AggregateRoot<IAggregateEvent>>(object: T): T {
    const eventBus = this.eventBus;
    object.publish = (event: IAggregateEvent) => {
      eventBus.publish(event, event.streamName);
    };
    return object;
  }
}