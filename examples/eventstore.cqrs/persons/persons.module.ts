import { Module } from '@nestjs/common';
import { PersonsController } from './controllers/persons.controller';
import { PersonsService } from './services/persons.service';
import { PersonRepository } from './repositories/person.repository';
import { PersonCommandHandlers } from './commands/handlers';
import { PersonQueryHandlers } from './queries/handlers';
import { PersonEventHandlers } from './events/handlers';
@Module({
  controllers: [PersonsController],
  providers: [
    PersonsService,
    PersonRepository,
    ...PersonQueryHandlers,
    ...PersonCommandHandlers,
    ...PersonEventHandlers,
  ],
})
export class PersonsModule { }
