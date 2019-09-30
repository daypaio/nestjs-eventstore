import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { AddPersonCommand } from '../impl/add-person.command';
import { EventPublisher } from 'nestjs-eventstore';
import { PersonAggregate } from '../../models/person.aggregate';

@CommandHandler(AddPersonCommand)
export class AddPersonCommandHandler
  implements ICommandHandler<AddPersonCommand> {
  private logger: Logger;
  constructor(private readonly publisher: EventPublisher) {
    this.logger = new Logger(this.constructor.name);
  }

  async execute(command: AddPersonCommand) {
    this.logger.log('COMMAND TRIGGERED: AddCommandHandler...');
    const { person, loggedInUserId } = command;
    const personAggregate = this.publisher.mergeObjectContext(
      new PersonAggregate(person._id, person),
    );
    personAggregate.add(loggedInUserId);
    personAggregate.commit();
  }
}
