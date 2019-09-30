import { prop, Typegoose } from 'typegoose';
import { ApiModelProperty } from '@nestjs/swagger';
import { IPerson } from './person.model.interface';

export class Person extends Typegoose implements IPerson {
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

  @ApiModelProperty({
    description: 'The ID of the person',
    required: true,
  })
  @prop({ required: true, unique: true })
  _id: string;

  @ApiModelProperty({
    description: 'The email of the person',
    required: true,
  })
  @prop({ required: true, unique: true })
  email: string;

  @ApiModelProperty({
    description: 'The first name of the person',
    required: true,
  })
  @prop({ required: true })
  firstName: string;

  @ApiModelProperty({
    description: 'The last name of the person',
    required: true,
  })
  @prop({ required: true })
  lastName: string;

  @ApiModelProperty({
    description: 'The phone number of the person',
    required: false,
  })
  @prop({ required: false })
  phoneNumber: number;
}
