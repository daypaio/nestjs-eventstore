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
Injects eventstore connector modules, components, bus and eventstore config into a nestjs application.

### Installation
`npm i --save nestjs-eventstore`

### Usage

**app.module.ts**

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