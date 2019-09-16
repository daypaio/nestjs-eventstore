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

interface ExtendedCatchUpSubscription extends EventStoreCatchUpSubscription {
  isLive: boolean | undefined;
}

export class EventStoreBus {
  private eventHandlers: IEventConstructors;
  private logger = new Logger('EventStoreBus');
  private catchupSubscriptions: ExtendedCatchUpSubscription[] = [];

  constructor(
    private eventStore: EventStore,
    private subject$: Subject<IEvent>,
    config: EventStoreBusConfig,
  ) {
    this.addEventHandlers(config.eventInstantiators);

    for (const subscription of config.subscriptions) {
      if (subscription.type === EventStoreSubscriptionType.Persistent) {
        this.subscribeToPersistentSubscription(
          subscription.stream,
          subscription.persistentSubscriptionName,
        );
      }
      if (subscription.type === EventStoreSubscriptionType.CatchUp) {
        this.catchupSubscriptions.push(this.subscribeToCatchupSubscription(subscription.stream));
      }
    }

  }

  get allCatchUpSubscriptionsLive(): boolean {
    return this.catchupSubscriptions.every(subscription => subscription.isLive);
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

  subscribeToCatchupSubscription(stream: string): ExtendedCatchUpSubscription {
    this.logger.log(`Catching up and subscribing to stream ${stream}!`);
    try {
      const subscription = this.eventStore.connection.subscribeToStreamFrom(
        stream,
        0,
        true,
        (sub, payload) => this.onEvent(sub, payload),
        () => this.onLiveProcessingStarted(subscription),
        (sub, reason, error) => this.onDropped(sub, reason, error),
      ) as ExtendedCatchUpSubscription;

      return subscription;
    } catch (err) {
      this.logger.error(err.message);
    }
  }

  async subscribeToPersistentSubscription(
    stream: string,
    subscriptionName: string,
  ): Promise<EventStorePersistentSubscription> {
    try {
      this.logger.log(`
      Connecting to persistent subscription ${subscriptionName} on stream ${stream}!
      `);
      return await this.eventStore.connection.connectToPersistentSubscription(
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

  onLiveProcessingStarted(subscription: ExtendedCatchUpSubscription) {
    subscription.isLive = true;
    this.logger.log('Live processing of EventStore events started!');
  }

  addEventHandlers(eventHandlers: IEventConstructors) {
    this.eventHandlers = { ...this.eventHandlers, ...eventHandlers };
  }
}
