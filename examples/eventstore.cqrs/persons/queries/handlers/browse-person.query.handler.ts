import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { BrowsePersonQuery } from '../impl/browse-person.query';
import { Person } from '../../models/person.model';
import { PersonRepository } from '../../repositories/person.repository';

@QueryHandler(BrowsePersonQuery)
export class BrowsePersonHandler implements IQueryHandler<BrowsePersonQuery> {
  private logger: Logger;
  constructor(private repository: PersonRepository) {
    this.logger = new Logger('BrowseQueryHandler');
  }

  async execute(): Promise<Person[]> {
    this.logger.log('Async BrowseHandler...');
    try {
      const result = await this.repository.find();
      return result;
    } catch (error) {
      this.logger.error('Failed to browse on Person');
      this.logger.log(error.message);
      this.logger.debug(error.stack);
      throw error;
    }
  }
}
