# nestjs-eventstore
---

<p align="left">
  <a href="https://github.com/daypaio/nestjs-eventstore"><img alt="GitHub Actions status" src="https://github.com/actions/setup-node/workflows/Main%20workflow/badge.svg"></a>
</p>

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/dm/@nestjs/core.svg" alt="NPM Downloads" /></a>

## Description
Injects eventstore connector modules, components, bus and eventstore config into a nestjs application. An example is provided in the examples folder.

### Installation
`npm i --save nestjs-eventstore`

### Usage

#### Using the EventStoreCqrsModule

`EventStoreCqrsModule` uses `@nestjs/cqrs` module under the hood. It overrides the default eventbus of `@nestjs/cqrs` and pushes the event to the eventstore rather than the internal eventBus.
Therefore the `eventBus.publish(event, streamName)` method takes [two arguments instead of one](https://github.com/daypaio/nestjs-eventstore/blob/2e09dd435c60a1a881b9b012d6c83f810b3c85da/src/event-store/eventstore-cqrs/event-store.bus.ts#L115). The first one is the event itself, and the second one is the stream name. 

Once the event is pushed to the eventStore all the subscriptions listening to that event are pushed that event from the event store. Event handlers can then be triggered to cater for those events.

**app.module.ts**

```typescript
import {
  EventStoreBusConfig,
  EventStoreSubscriptionType,
} from 'nestjs-eventstore';

//linking of events from EventStore to local events
const EventInstantiators = [
  SomeEvent: (_id: any, data: any, loggedInUserId: any) => new SomeEvent(_id, data, loggedInUserId);
];

export const eventStoreBusConfig: EventStoreBusConfig = {
  subscriptions: [
    { // persistanct subscription
      type: EventStoreSubscriptionType.Persistent,
      stream: '$ce-persons',
      persistentSubscriptionName: 'contacts',
    },
    { // Catchup subscription
      type: EventStoreSubscriptionType.CatchUp,
      stream: '$ce-users',
    },
  ],
  events: {
    ...EventInstantiators
  },
};

@Module({
  imports: [
    ConfigModule.load(path.resolve(__dirname, 'config', '**/!(*.d).{ts,js}')),
    EventStoreCqrsModule.forRootAsync(
      {
        useFactory: async (config: ConfigService) => {
          return {
            connectionSettings: config.get('eventstore.connectionSettings'),
            endpoint: config.get('eventstore.tcpEndpoint'),
          };
        },
        inject: [ConfigService],
      },
      eventStoreBusConfig,
    ),
  ],
})
export class AppModule {}

```

**custom.command.handler.ts**

This following is a way to use the command handlers that push to the custom eventBus to the eventstore using aggregate root.

```typescript
import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { SomeCommand } from '../impl/some.command';
import { EventPublisher } from 'nestjs-eventstore'; //this is necessary as it overrides the default publisher
import { ObjectAggregate } from '../../models/object.aggregate';

@CommandHandler(SomeCommand)
export class SomeCommandHandler
  implements ICommandHandler<SomeCommand> {
  constructor(private readonly publisher: EventPublisher) {}

  async execute(command: SomeCommand) {
    const { object, loggedInUserId } = command;
    const objectAggregate = this.publisher.mergeObjectContext(
      new ObjectAggregate(object._id, object),
    );
    objectAggregate.add(loggedInUserId);
    objectAggregate.commit();
  }
}

```


#### Using the EventStoreModule

`EventStoreModule` connects directly to the event store without cqrs implementation.

**app.module.ts**

```typescript
@Module({
  imports: [
    ConfigModule.load(path.resolve(__dirname, 'config', '**/!(*.d).{ts,js}')),
    EventStoreCqrsModule.forRootAsync(
      {
        useFactory: async (config: ConfigService) => {
          return {
            connectionSettings: config.get('eventstore.connectionSettings'),
            endpoint: config.get('eventstore.tcpEndpoint'),
          };
        },
        inject: [ConfigService],
      },
    ),
  ],
})
export class AppModule {}

```