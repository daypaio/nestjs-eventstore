import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PersonRepository } from '../../repositories/person.repository';
import { PersonAddedEvent } from '../impl';

@EventsHandler(PersonAddedEvent)
export class AddPersonEventHandler implements IEventHandler<PersonAddedEvent> {
  private logger = new Logger('AddEventHandler');

  constructor(private repository: PersonRepository) {}
  async handle(event: PersonAddedEvent) {
    this.logger.verbose(`EVENT TRIGGERED: ${event.constructor.name}}`);
    const { _id, data } = event;
    try {
      await this.repository.create(data);
    } catch (error) {
      this.logger.error(`Failed to create person of id ${_id}`);
      this.logger.log(error.message);
      this.logger.debug(error.stack);
    }
  }
}
