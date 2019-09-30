import {
  Controller,
  Get,
  Param,
  Patch,
  Body,
  Post,
  Delete,
} from '@nestjs/common';
import { PersonsService } from '../services/persons.service';
import { UpdatePersonDto } from '../dto/update-person.dto';
import { IPerson } from '../models/person.model.interface';

@Controller('persons')
export class PersonsController {
  constructor(private service: PersonsService) { }

  async browse(): Promise<any> {
    return await this.service.browse();
  }

  @Get('/:id')
  async read(
    @Param('id') id: string,
  ): Promise<IPerson> {
    return await this.service.read(id);
  }

  @Patch('/:id')
  async edit(
    @Param('id') id: string,
    @Body() object: UpdatePersonDto,
  ): Promise<void> {
    await this.service.edit(id, object);
  }

  @Post()
  async add(
    @Body() object: IPerson
  ): Promise<void> {
    await this.service.add(object);
  }

  @Delete('/:id')
  async delete(
    @Param('id') id: string
  ): Promise<void> {
    await this.service.delete(id);
  }
}
