import { Global, Module, DynamicModule } from '@nestjs/common';
import { EventStore } from './event-store.class';
import { ConnectionSettings, TcpEndPoint } from 'node-eventstore-client';

export interface EventStoreModuleOptions {
  connectionSettings: ConnectionSettings;
  endpoint: TcpEndPoint;
}

export interface EventStoreModuleAsyncOptions {
  useFactory: (...args: any[]) => Promise<any> | any;
  inject?: any[];
}

@Global()
@Module({
  providers: [EventStore],
  exports: [EventStore],
})
export class EventStoreModule {
  static forRoot(
    settings: ConnectionSettings,
    endpoint: TcpEndPoint,
  ): DynamicModule {
    return {
      module: EventStoreModule,
      providers: [
        {
          provide: EventStore,
          useFactory: () => {
            return new EventStore(settings, endpoint);
          },
        },
      ],
      exports: [EventStore],
    };
  }

  static forRootAsync(options: EventStoreModuleAsyncOptions): DynamicModule {
    return {
      module: EventStoreModule,
      providers: [
        {
          provide: EventStore,
          useFactory: async (...args) => {
            const { connectionSettings, endpoint } = await options.useFactory(
              ...args,
            );
            return new EventStore(connectionSettings, endpoint);
          },
          inject: options.inject,
        },
      ],
      exports: [EventStore],
    };
  }
}
