# nestjs-eventstore
---

<p align="left">
  <a href="https://github.com/daypaio/nestjs-eventstore"><img alt="GitHub Actions status" src="https://github.com/actions/setup-node/workflows/Main%20workflow/badge.svg"></a>
</p>

## Description
Injects eventstore connector modules, components, bus and eventstore config into a nestjs application.

## Installation
`npm i --save nestjs-eventstore`

### Usage

*app.module.ts*

```typescript
import {
  EventStoreModule,
  EventStore,
  EventBusProvider,
  EventStoreBusConfig,
  EventStoreSubscriptionType,
} from 'nestjs-eventstore';

import { CustomEventHandlers } from './events/handlers';

const eventStoreBusConfig: EventStoreBusConfig = {
  subscriptions: [
    {
      type: EventStoreSubscriptionType.CatchUp,
      stream: '$ce-identities',
    },
  ],
  eventInstantiators: {
    EventName: data => new ImplementedEventName(data),
    ...
    ...
  },
  eventHandlers: CustomEventHandlers,
};

@Module({
  imports: [
    EventStoreModule.forRootAsync({
      useFactory: async (config: ConfigService) => {
        return {
          connectionSettings: config.get('eventstore.connectionSettings'),
          endpoint: config.get('eventstore.tcpEndpoint'),
        };
      },
      inject: [ConfigService],
    }),
  ],
})

export class AppModule {
}

```