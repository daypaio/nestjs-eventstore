import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PersonRepository } from '../../repositories/person.repository';
import { PersonEditedEvent } from '../impl';

@EventsHandler(PersonEditedEvent)
export class EditPersonEventHandler
  implements IEventHandler<PersonEditedEvent> {
  private logger = new Logger('EditEventHandler');
  constructor(private repository: PersonRepository) {}
  async handle(event: PersonEditedEvent) {
    this.logger.verbose(`EVENT TRIGGERED: ${event.constructor.name}`);
    const { _id, data, loggedInUserId } = event;
    try {
      const result = await this.repository.updateById(_id, data);
      return result;
    } catch (error) {
      this.logger.error(`Failed to update person of id: ${_id}`);
      this.logger.log(error.message);
      this.logger.debug(error.stack);
    }
  }
}
