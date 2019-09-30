import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EditPersonCommand } from '../impl/edit-person.command';
import { Logger } from '@nestjs/common';
import { EventPublisher } from 'nestjs-eventstore';
import { PersonAggregate } from '../../models/person.aggregate';

@CommandHandler(EditPersonCommand)
export class EditPersonCommandHandler
  implements ICommandHandler<EditPersonCommand> {
  private logger: Logger;
  constructor(private readonly publisher: EventPublisher) {
    this.logger = new Logger('EditCommandHandler');
  }

  async execute(command: EditPersonCommand) {
    this.logger.log('COMMAND TRIGGERED: EditCommandHandler...');
    const { id, person, loggedInUserId } = command;
    person._id = id;
    const personAggregate = this.publisher.mergeObjectContext(
      new PersonAggregate(person._id, person),
    );
    personAggregate.edit(loggedInUserId);
    personAggregate.commit();
  }
}
