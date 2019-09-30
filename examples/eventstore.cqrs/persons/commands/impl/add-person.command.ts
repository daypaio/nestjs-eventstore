import { ICommand } from '@nestjs/cqrs';
import { IPerson } from '../../models/person.model.interface';

export class AddPersonCommand implements ICommand {
  constructor(
    public readonly person: IPerson,
    public readonly loggedInUserId: string,
  ) {}
}
