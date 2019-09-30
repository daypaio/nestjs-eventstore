import { AggregateRoot } from '@nestjs/cqrs';
import { IPerson } from './person.model.interface';
import { IsDefined, IsEmail, IsString, IsNumberString } from 'class-validator';
import {
  PersonAddedEvent,
  PersonEditedEvent,
  PersonDeletedEvent,
} from '../events/impl';

export class PersonAggregate extends AggregateRoot implements IPerson {
  constructor(id: string, person?: any) {
    super();
    this._id = id;
    if (person) {
      this.email = person.email ? person.email : undefined;
      this.firstName = person.firstName ? person.firstName : undefined;
      this.lastName = person.lastName ? person.lastName : undefined;
      this.phoneNumber = person.phoneNumber ? person.phoneNumber : undefined;
    }
  }

  @IsDefined()
  _id: string;

  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsNumberString()
  phoneNumber: number;

  add(loggedInUserId: string) {
    this.apply(new PersonAddedEvent(this._id, this, loggedInUserId));
  }

  edit(loggedInUserId: string) {
    this.apply(new PersonEditedEvent(this._id, this, loggedInUserId));
  }

  delete(loggedInUserId: string) {
    this.apply(new PersonDeletedEvent(this._id, loggedInUserId));
  }
}
