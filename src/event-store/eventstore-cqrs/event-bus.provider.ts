import { Injectable, OnModuleDestroy, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Observable, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { isFunction } from 'util';
import {
  IEventHandler,
  IEvent,
  ObservableBus,
  CommandBus,
  InvalidSagaException,
  ISaga,
} from '@nestjs/cqrs';
import {
  SAGA_METADATA,
  EVENTS_HANDLER_METADATA,
} from '@nestjs/cqrs/dist/decorators/constants';
import { EventStoreBus, IEventConstructors } from './event-store.bus';
import { EventStore } from '../event-store.class';
import { CqrsOptions } from '@nestjs/cqrs/dist/interfaces/cqrs-options.interface';

export enum EventStoreSubscriptionType {
  Persistent,
  CatchUp,
}

export type EventStorePersistentSubscription = {
  type: EventStoreSubscriptionType.Persistent;
  stream: string;
  persistentSubscriptionName: string;
};

export type EventStoreCatchupSubscription = {
  type: EventStoreSubscriptionType.CatchUp;
  stream: string;
};

export type EventStoreSubscriptionConfig = {
  persistentSubscriptionName: string;
};

export type EventStoreSubscription =
  | EventStorePersistentSubscription
  | EventStoreCatchupSubscription;

export type EventStoreBusConfig = {
  subscriptions: EventStoreSubscription[];
  events: IEventConstructors;
};

export type EventHandlerType = Type<IEventHandler<IEvent>>;

@Injectable()
export class EventBusProvider extends ObservableBus<IEvent>
  implements OnModuleDestroy {
  private _publisher: EventStoreBus;
  private readonly subscriptions: Subscription[];
  private readonly cqrsOptions: CqrsOptions;

  constructor(
    private readonly commandBus: CommandBus,
    private readonly moduleRef: ModuleRef,
    private readonly eventStore: EventStore,
    private config: EventStoreBusConfig,
  ) {
    super();
    this.subscriptions = [];
    this.useDefaultPublisher();
  }

  get publisher(): EventStoreBus {
    return this._publisher;
  }

  set publisher(_publisher: EventStoreBus) {
    this._publisher = _publisher;
  }

  onModuleDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  publish<T extends IEvent>(event: T, stream: string) {
    return this._publisher.publish(event, stream);
  }

  publishAll(events: IEvent[]) {
    return Promise.all((events || []).map(event => this._publisher.publish(event)));
  }

  bind(handler: IEventHandler<IEvent>, name: string) {
    const stream$ = name ? this.ofEventName(name) : this.subject$;
    const subscription = stream$.subscribe(event => handler.handle(event));
    this.subscriptions.push(subscription);
  }

  registerSagas(types: Type<any>[] = []) {
    const sagas = types
      .map((target) => {
        const metadata = Reflect.getMetadata(SAGA_METADATA, target) || [];
        const instance = this.moduleRef.get(target, { strict: false });
        if (!instance) {
          throw new InvalidSagaException();
        }
        return metadata.map((key: string) => instance[key]);
      })
      .reduce((a, b) => a.concat(b), []);

    sagas.forEach(saga => this.registerSaga(saga));
  }

  register(handlers: EventHandlerType[] = []) {
    handlers.forEach(handler => this.registerHandler(handler));
  }

  protected registerHandler(handler: EventHandlerType) {
    const instance = this.moduleRef.get(handler, { strict: false });
    if (!instance) {
      return;
    }
    const eventsNames = this.reflectEventsNames(handler);
    eventsNames.map(event =>
      this.bind(instance as IEventHandler<IEvent>, event.name),
    );
  }

  protected ofEventName(name: string) {
    return this.subject$.pipe(
      filter(event => this.getEventName(event) === name),
    );
  }

  private getEventName(event): string {
    const { constructor } = Object.getPrototypeOf(event);
    return constructor.name as string;
  }

  protected registerSaga(saga: ISaga) {
    if (!isFunction(saga)) {
      throw new InvalidSagaException();
    }
    const stream$ = saga(this);
    if (!(stream$ instanceof Observable)) {
      throw new InvalidSagaException();
    }

    const subscription = stream$
      .pipe(filter(e => !!e))
      .subscribe(command => this.commandBus.execute(command));

    this.subscriptions.push(subscription);
  }

  private reflectEventsNames(handler: EventHandlerType): FunctionConstructor[] {
    return Reflect.getMetadata(EVENTS_HANDLER_METADATA, handler);
  }

  private useDefaultPublisher() {
    const pubSub = new EventStoreBus(
      this.eventStore,
      this.subject$,
      this.config,
    );
    this._publisher = pubSub;
  }
}
