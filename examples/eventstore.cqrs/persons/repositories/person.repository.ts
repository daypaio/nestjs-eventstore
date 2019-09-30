import { Person } from '../models/person.model';
import { InjectModel } from 'nestjs-typegoose';

import {
  Logger,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ModelType } from 'typegoose';

export class PersonRepository {

  private logger: Logger;
  constructor(@InjectModel(Person) private model: ModelType<T>) {
    this.logger = new Logger(`${this.model.modelName}Repository`);
  }

  private generateErrorMessage(
    error: any,
    operation: string,
    id?: string,
    data?: any,
  ) {
    const errorMessage = error.message;
    const operationMessage = `${
      this.model.modelName
      } could not be ${operation.toLowerCase()}ed}`;
    const idMessage = id ? `ID: ${id}` : '';
    const dataMessage = data ? JSON.stringify(data) : '';
    return {
      error: operationMessage + errorMessage,
      data: idMessage + dataMessage,
      verbose: `${error.constructor.name} \n
        ${operationMessage} \n
        ${errorMessage} \n
        ${idMessage} \n
        ${dataMessage}`,
    };
  }

  async create(data: any): Promise<void> {
    this.logger.verbose('CREATE');
    console.table(data);
    try {
      await this.model.create(data);
    } catch (error) {
      const message = this.generateErrorMessage(
        error,
        'create',
        data._id,
        data,
      );
      this.logger.verbose(message.verbose);
      throw error;
    }
  }

  async updateById(id: string, data: any): Promise<void> {
    this.logger.verbose('EDIT');
    console.table({ data, _id: id });
    try {
      const result = await this.model.updateOne({ _id: id }, { $set: data });
      const { n, nModified } = result;
      if (nModified > 0) {
        return;
      }
      if (n < 1) {
        throw new NotFoundException();
      }
      if (nModified < 1) {
        this.logger.verbose(
          `Document for ${this.model.modelName} matched but information was the same`,
        );
        return;
      }
      throw new InternalServerErrorException(
        `Failed editing model for ${this.model.modelName}: result: ${result}`,
      );
    } catch (error) {
      const message = this.generateErrorMessage(error, 'updated', id, data);
      this.logger.verbose(message.verbose);
      throw error;
    }
  }

  async deleteById(id: string): Promise<void> {
    this.logger.verbose('DELETE');
    console.table({ id });
    try {
      const result = await this.model.deleteOne({ _id: id });
      const { n, deletedCount } = result;
      if (deletedCount > 0) {
        return;
      }
      if (n < 1) {
        throw new NotFoundException();
      }
      if (deletedCount < 1) {
        this.logger.verbose(
          `${this.model.modelName} was found with id: ${id} but could not be deleted, with result: ${result} `,
        );
      }
      throw new InternalServerErrorException();
    } catch (error) {
      const message = this.generateErrorMessage(error, 'delete', id);
      this.logger.verbose(message.verbose);
      throw error;
    }
  }

  async find(): Promise<T[]> {
    this.logger.verbose('FIND');
    try {
      const result = await this.model.find({}, { __v: 0 });
      return result;
    } catch (error) {
      const message = this.generateErrorMessage(error, 'find');
      this.logger.verbose(message.verbose);
      throw error;
    }
  }

  async findById(id: string): Promise<T> {
    this.logger.verbose('FIND BY ID');
    console.table({ id });
    try {
      const result = await this.model.findById(id, { __v: 0 });
      if (result == null) {
        throw new NotFoundException();
      }
      return result;
    } catch (error) {
      const message = this.generateErrorMessage(error, 'find', id);
      this.logger.verbose(message.verbose);
      throw error;
    }
  }
}
