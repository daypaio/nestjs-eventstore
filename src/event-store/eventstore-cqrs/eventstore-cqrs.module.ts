import { CqrsModule, EventBus, CommandBus, QueryBus } from '@nestjs/cqrs';
import { Global, Module, DynamicModule } from '@nestjs/common';
import { EventBusProvider, EventStoreBusConfig } from './event-bus.provider';
import { EventStore } from '../event-store.class';
import { ExplorerService } from '@nestjs/cqrs/dist/services/explorer.service';
import { ModuleRef } from '@nestjs/core';
import {
  EventStoreModule,
  EventStoreModuleAsyncOptions,
} from '../event-store.module';

@Global()
@Module({})
export class EventStoreCqrsModule {
  constructor(
    private readonly explorerService: ExplorerService,
    private readonly eventsBus: EventBus,
    private readonly commandsBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  onModuleInit() {
    const { events, queries, sagas, commands } = this.explorerService.explore();

    this.eventsBus.register(events);
    this.commandsBus.register(commands);
    this.queryBus.register(queries);
    this.eventsBus.registerSagas(sagas);
  }

  static forRootAsync(
    options: EventStoreModuleAsyncOptions,
    eventStoreBusConfig: EventStoreBusConfig,
  ): DynamicModule {
    return {
      module: EventStoreCqrsModule,
      imports: [EventStoreModule.forRootAsync(options)],
      providers: [
        CommandBus,
        QueryBus,
        ExplorerService,
        {
          provide: EventBus,
          useFactory: (commandBus, moduleRef, eventStore) => {
            return new EventBusProvider(
              commandBus,
              moduleRef,
              eventStore,
              eventStoreBusConfig,
            );
          },
          inject: [CommandBus, ModuleRef, EventStore],
        },
        {
          provide: EventBusProvider,
          useExisting: EventBus,
        },
      ],
      exports: [
        EventStoreModule,
        EventBusProvider,
        EventBus,
        CommandBus,
        QueryBus,
        ExplorerService,
      ],
    };
  }
}
