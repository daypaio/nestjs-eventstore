import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { DeletePersonCommand } from '../impl/delete-person.command';
import { Logger } from '@nestjs/common';
import { EventPublisher } from 'nestjs-eventstore';
import { PersonAggregate } from '../../models/person.aggregate';

@CommandHandler(DeletePersonCommand)
export class DeletePersonCommandHandler
  implements ICommandHandler<DeletePersonCommand> {
  private logger: Logger;
  constructor(private readonly publisher: EventPublisher) {
    this.logger = new Logger('DeleteCommandHandler');
  }

  async execute(command: DeletePersonCommand) {
    this.logger.log('COMMAND TRIGGERED: DeleteCommandHandler...');
    const { id, loggedInUserId } = command;
    const personAggregate = this.publisher.mergeObjectContext(
      new PersonAggregate(id),
    );
    personAggregate.delete(loggedInUserId);
    personAggregate.commit();
  }
}
