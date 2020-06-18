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
  retryAttempts: number;

  private logger: Logger = new Logger(this.constructor.name);

  constructor(
    private settings: ConnectionSettings,
    private endpoint: TcpEndPoint,
  ) {
    this.retryAttempts = 0;
    this.connect();
  }

  async connect() {
    this.connection = createConnection(this.settings, this.endpoint);
    this.connection.connect();
    this.connection.on('connected', () => {
      this.logger.log('Connection to EventStore established!');
      this.retryAttempts = 0;
      this.isConnected = true;
    });
    this.connection.on('closed', () => {
      this.logger.error(`Connection to EventStore closed! reconnecting attempt(${this.retryAttempts})...`);
      this.retryAttempts += 1;
      this.isConnected = false;
      this.connect();
    });
  }

  getConnection(): EventStoreNodeConnection {
    return this.connection;
  }

  close() {
    this.connection.close();
  }
}
