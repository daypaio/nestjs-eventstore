import { IEvent } from '@nestjs/cqrs';
import { Subject } from 'rxjs';
import {
  EventData,
  createEventData,
  EventStorePersistentSubscription,
  ResolvedEvent,
  EventStoreCatchUpSubscription,
} from 'node-eventstore-client';
import { v4 } from 'uuid';
import { Logger } from '@nestjs/common';
import { EventStore } from './event-store.class';
import { EventStoreBusConfig, EventStoreSubscriptionType } from './event-bus.provider';

export interface IEventConstructors {
  [key: string]: (...args: any[]) => IEvent;
}

export class EventStoreBus {
  private eventHandlers: IEventConstructors;
  private logger = new Logger('EventStoreBus');

  constructor(
    private eventStore: EventStore,
    private subject$: Subject<IEvent>,
    private config: EventStoreBusConfig,
  ) {
    this.addEventHandlers(config.eventInstantiators);

    this.config.subscriptions.forEach((subscription) => {
      if (subscription.type === EventStoreSubscriptionType.Persistent) {
        this.subscribeToPersistentSubscription(
          subscription.stream,
          subscription.persistentSubscriptionName,
        );
      }
      if (subscription.type === EventStoreSubscriptionType.CatchUp) {
        this.subscribeToCatchupSubscription(subscription.stream);
      }
    });

  }

  async publish(event: IEvent, stream?: string) {
    const payload: EventData = createEventData(
      v4(),
      event.constructor.name,
      true,
      Buffer.from(JSON.stringify(event)),
    );

    try {
      await this.eventStore.connection.appendToStream(stream, -2, [payload]);
    } catch (err) {
      this.logger.error(err);
    }
  }

  async subscribeToCatchupSubscription(stream: string) {
    this.logger.log(`Catching up and subscribing to stream ${stream}!`);
    try {
      this.eventStore.connection.subscribeToStreamFrom(
        stream,
        0,
        true,
        (sub, payload) => this.onEvent(sub, payload),
        () => this.onLiveProcessingStarted(),
        (sub, reason, error) => this.onDropped(sub, reason, error),
      );
    } catch (err) {
      this.logger.error(err.message);
    }
  }

  async subscribeToPersistentSubscription(stream: string, subscriptionName: string) {
    try {
      this.logger.log(`
      Connecting to persistent
      subscription ${subscriptionName}
      on stream ${stream}!
      `);
      await this.eventStore.connection.connectToPersistentSubscription(
        stream,
        subscriptionName,
        (sub, payload) => this.onEvent(sub, payload),
        (sub, reason, error) => this.onDropped(sub, reason, error),
      );
    } catch (err) {
      this.logger.error(err.message);
    }
  }

  async onEvent(
    _subscription: EventStorePersistentSubscription | EventStoreCatchUpSubscription,
    payload: ResolvedEvent,
  ) {
    const { event } = payload;
    const data = Object.values(JSON.parse(event.data.toString()));
    this.logger.log(data);
    this.subject$.next(this.eventHandlers[event.eventType](...data));
  }

  onDropped(
    _subscription: EventStorePersistentSubscription | EventStoreCatchUpSubscription,
    _reason: string,
    error: Error,
  ) {
    this.logger.error(error);
  }

  onLiveProcessingStarted() {
    this.logger.log('Live processing of EventStore events started!');
  }

  addEventHandlers(eventHandlers: IEventConstructors) {
    this.eventHandlers = { ...this.eventHandlers, ...eventHandlers };
  }
}
