import { ApiModelPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEmail, IsString, IsNumberString } from 'class-validator';
import { Dto } from '../../shared/dtos/dto.interface';

export class UpdatePersonDto implements Dto {
  constructor(person?: any) {
    if (person) {
      this.email = person.email;
      this.firstName = person.firstName;
      this.lastName = person.lastName;
      this.phoneNumber = person.phoneNumber;
    }
  }
  @ApiModelPropertyOptional({
    description: 'The email of the person',
  })
  @IsOptional()
  @IsEmail()
  @IsString()
  email: string;

  @ApiModelPropertyOptional({
    description: 'The first name  of the person',
  })
  @IsOptional()
  @IsString()
  firstName: string;

  @ApiModelPropertyOptional({
    description: 'The last name  of the person',
  })
  @IsOptional()
  @IsString()
  lastName: string;

  @ApiModelPropertyOptional({
    description: 'The phone number  of the person',
  })
  @IsOptional()
  @IsNumberString()
  phoneNumber: string;
}
