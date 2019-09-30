import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { ReadPersonQuery } from '../impl/read-person.query';
import { Logger } from '@nestjs/common';
import { PersonRepository } from '../../repositories/person.repository';

@QueryHandler(ReadPersonQuery)
export class ReadPersonHandler implements IQueryHandler<ReadPersonQuery> {
  private logger: Logger;
  constructor(private repository: PersonRepository) {
    this.logger = new Logger('ReadQueryHandler');
  }

  async execute(query: ReadPersonQuery) {
    this.logger.log('Async ReadHandler...');

    const { id } = query;
    try {
      return await this.repository.findById(id);
    } catch (error) {
      this.logger.error(`Failed to read person of id ${id}`);
      this.logger.log(error.message);
      this.logger.debug(error.stack);
      throw error;
    }
  }
}
