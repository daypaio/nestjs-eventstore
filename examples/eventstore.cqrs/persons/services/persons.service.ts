import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus, ICommand, IQuery } from '@nestjs/cqrs';
import { Person } from '../models/person.model';
import { BrowsePersonQuery } from '../queries/impl/browse-person.query';
import { ReadPersonQuery } from '../queries/impl/read-person.query';
import { EditPersonCommand } from '../commands/impl/edit-person.command';
import { AddPersonCommand } from '../commands/impl/add-person.command';
import { DeletePersonCommand } from '../commands/impl/delete-person.command';
import { UpdatePersonDto } from '../dto/update-person.dto';
import { IPerson } from '../models/person.model.interface';

@Injectable()
export class PersonsService {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {
  }

  protected async executeCommand(command: ICommand): Promise<void> {
    if (this.commandBus instanceof CommandBus) {
      return await this.commandBus.execute(command);
    }
  }

  protected async executeQuery(query: IQuery): Promise<any> {
    if (this.queryBus instanceof QueryBus) {
      return await this.queryBus.execute(query);
    }
  }

  async browse(userId: string): Promise<any[]> {
    return await this.executeQuery(new BrowsePersonQuery(userId));
  }

  async read(id: string, userId: string): Promise<Person> {
    return await this.executeQuery(new ReadPersonQuery(id, userId));
  }

  async edit(
    id: string,
    object: UpdatePersonDto,
    userId: string,
  ): Promise<void> {
    return await this.executeCommand(
      new EditPersonCommand(id, object as any, userId),
    );
  }

  async add(object: IPerson, userId: string): Promise<void> {
    return await this.executeCommand(new AddPersonCommand(object, userId));
  }

  async delete(id: string, userId: string): Promise<void> {
    return await this.executeCommand(new DeletePersonCommand(id, userId));
  }
}
