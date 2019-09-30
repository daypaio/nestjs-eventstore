import { ICommand } from '@nestjs/cqrs';
import { IPerson } from '../../models/person.model.interface';

export class EditPersonCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly person: Partial<IPerson>,
    public readonly loggedInUserId: string,
  ) {}
}
