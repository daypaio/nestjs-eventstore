import { AddPersonEventHandler } from './add-person.event.handler';
import { DeletePersonEventHandler } from './delete-person.event.handler';
import { EditPersonEventHandler } from './edit-person.event.handler';

export const PersonEventHandlers = [
  AddPersonEventHandler,
  DeletePersonEventHandler,
  EditPersonEventHandler,
];
