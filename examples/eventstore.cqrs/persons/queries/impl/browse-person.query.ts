import { IQuery } from '@nestjs/cqrs';
export class BrowsePersonQuery implements IQuery {
  constructor(public user: string) {}
}
