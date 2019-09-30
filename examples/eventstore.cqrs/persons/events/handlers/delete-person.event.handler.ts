import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PersonRepository } from '../../repositories/person.repository';
import { PersonDeletedEvent } from '../impl';

@EventsHandler(PersonDeletedEvent)
export class DeletePersonEventHandler
  implements IEventHandler<PersonDeletedEvent> {
  private logger = new Logger('DeleteEventHandler');
  constructor(private repository: PersonRepository) {}
  async handle(event: PersonDeletedEvent) {
    this.logger.verbose(`EVENT TRIGGERED: ${event.constructor.name}}`);
    const { _id, loggedInUserId } = event;
    try {
      const result = await this.repository.deleteById(_id);
      return result;
    } catch (error) {
      this.logger.error(`Cannot delete person of id ${_id}`);
      this.logger.log(error.message);
      this.logger.debug(error.stack);
      // Retry event possibly
    }
  }
}
