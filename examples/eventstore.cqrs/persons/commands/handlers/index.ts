import { AddPersonCommandHandler } from './add-person.command.handler';
import { DeletePersonCommandHandler } from './delete-person.command.handler';
import { EditPersonCommandHandler } from './edit-person.command.handler';

export const PersonCommandHandlers = [
  AddPersonCommandHandler,
  DeletePersonCommandHandler,
  EditPersonCommandHandler,
];
