import { IQuery } from '@nestjs/cqrs';

export class ReadPersonQuery implements IQuery {
  constructor(public readonly id: string, public loggedInUserId: string) {}
}
