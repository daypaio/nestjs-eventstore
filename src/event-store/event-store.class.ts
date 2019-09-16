import {
  createConnection,
  EventStoreNodeConnection,
  ConnectionSettings,
  TcpEndPoint,
} from 'node-eventstore-client';
import { Logger } from '@nestjs/common';

export class EventStore {

  connection: EventStoreNodeConnection;

  isConnected: boolean = false;

  private logger: Logger = new Logger(this.constructor.name);

  constructor(private settings: ConnectionSettings, private endpoint: TcpEndPoint) {
    this.connect();
  }

  async connect() {
    this.connection = createConnection(this.settings, this.endpoint);
    this.connection.connect();
    this.connection.on('connected', () => {
      this.logger.log('Connection to EventStore established!');
      this.isConnected = true;
    });
    this.connection.on('closed', () => {
      this.logger.error('Connection to EventStore closed!');
      this.isConnected = false;
      this.connect();
    });
  }

  close() {
    this.connection.close();
  }
}
