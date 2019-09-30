import { Person } from '../../models/person.model';
import { EventBus, CqrsModule } from '@nestjs/cqrs';
import { AddPersonEventHandler } from './add-person.event.handler';
import { EditPersonEventHandler } from './edit-person.event.handler';
import { DeletePersonEventHandler } from './delete-person.event.handler';
import { TestingModule, Test } from '@nestjs/testing';
import { PersonEventHandlers } from '.';
import { PersonRepository } from '../../repositories/person.repository';
import {
  PersonAddedEvent,
  PersonEditedEvent,
  PersonDeletedEvent,
} from '../impl';

const mockPersonRepository = () => ({
  create: jest.fn(),
  updateById: jest.fn(),
  deleteById: jest.fn(),
});

const mockUserId = 'mock123';

function createMockPersons(): Person[] {
  const firstPerson = new Person('org1', {
    firstName: 'T',
    lastName: 'Alam',
    email: 't@example.com',
    phoneNumber: 12345,
  });

  const secondPerson = new Person('org2', {
    firstName: 'J',
    lastName: 'Grosch',
    email: 'j@example.com',
    phoneNumber: 12345,
  });

  const arrayOfPersons: Person[] = [];
  arrayOfPersons.push(firstPerson);
  arrayOfPersons.push(secondPerson);

  return arrayOfPersons;
}

describe('PersonEventHandlers', () => {
  const mockPersons: Person[] = createMockPersons();
  let eventBus: EventBus;
  let repo;

  let addPersonEventHandler: AddPersonEventHandler;
  let editPersonEventHandler: EditPersonEventHandler;
  let deletePersonEventHandler: DeletePersonEventHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        ...PersonEventHandlers,
        {
          provide: PersonRepository,
          useFactory: mockPersonRepository,
        },
      ],
    }).compile();
    eventBus = module.get<EventBus>(EventBus);
    repo = module.get<PersonRepository>(PersonRepository);

    addPersonEventHandler = module.get<AddPersonEventHandler>(
      AddPersonEventHandler,
    );
    editPersonEventHandler = module.get<EditPersonEventHandler>(
      EditPersonEventHandler,
    );
    deletePersonEventHandler = module.get<DeletePersonEventHandler>(
      DeletePersonEventHandler,
    );
  });

  describe(' for AddPersonEventHandler', () => {
    it('should successfully return an array of persons', async () => {
      repo.create.mockResolvedValue(null);
      eventBus.register([AddPersonEventHandler]);
      expect(repo.create).not.toHaveBeenCalled();
      await eventBus.publish(
        new PersonAddedEvent(mockPersons[0]._id, mockPersons[0], mockUserId),
      );
      expect(repo.create).toHaveBeenCalledWith(mockPersons[0]);
    });

    it('should log the error if repo.create() fails', async () => {
      const logger = (addPersonEventHandler as any).logger;
      repo.create.mockReturnValue(
        Promise.reject(new Error('This is an auto generated error')),
      );
      eventBus.register([AddPersonEventHandler]);
      jest.spyOn(logger, 'error');
      expect(repo.create).not.toHaveBeenCalled();
      await eventBus.publish(
        new PersonAddedEvent(mockPersons[0]._id, mockPersons[0], mockUserId),
      );
      expect(repo.create).toHaveBeenCalledWith(mockPersons[0]);
      expect(logger.error).toHaveBeenCalledTimes(1);
    });
  });

  describe(' for EditOrganizationEventHandler', () => {
    it('should successfully repo.updatedById() without any errors', async () => {
      repo.updateById.mockResolvedValue(null);
      eventBus.register([EditPersonEventHandler]);
      expect(repo.updateById).not.toHaveBeenCalled();
      await eventBus.publish(
        new PersonEditedEvent(mockPersons[0]._id, mockPersons[0], mockUserId),
      );
      expect(repo.updateById).toHaveBeenCalledWith(
        mockPersons[0]._id,
        mockPersons[0],
      );
    });

    it('should log the error if repo.updateById() fails', async () => {
      const logger = (editPersonEventHandler as any).logger;
      repo.updateById.mockReturnValue(
        Promise.reject(new Error('This is an auto generated error')),
      );
      eventBus.register([EditPersonEventHandler]);
      jest.spyOn(logger, 'error');
      expect(repo.updateById).not.toHaveBeenCalled();
      await eventBus.publish(
        new PersonEditedEvent(mockPersons[0]._id, mockPersons[0], mockUserId),
      );
      expect(repo.updateById).toHaveBeenCalledWith(
        mockPersons[0]._id,
        mockPersons[0],
      );
      expect(logger.error).toHaveBeenCalledTimes(1);
    });
  });

  describe(' for DeleteOrganizationEventHandler', () => {
    it('should successfully repo.deleteById() without any errors', async () => {
      repo.updateById.mockResolvedValue(null);
      eventBus.register([DeletePersonEventHandler]);
      expect(repo.deleteById).not.toHaveBeenCalled();
      await eventBus.publish(
        new PersonDeletedEvent(mockPersons[0]._id, mockUserId),
      );
      expect(repo.deleteById).toHaveBeenCalledWith(mockPersons[0]._id);
    });

    it('should log the error if repo.deleteById() fails', async () => {
      const logger = (deletePersonEventHandler as any).logger;
      repo.deleteById.mockReturnValue(
        Promise.reject(new Error('This is an auto generated error')),
      );
      eventBus.register([DeletePersonEventHandler]);
      jest.spyOn(logger, 'error');
      expect(repo.deleteById).not.toHaveBeenCalled();
      await eventBus.publish(
        new PersonDeletedEvent(mockPersons[0]._id, mockUserId),
      );
      expect(repo.deleteById).toHaveBeenCalledWith(mockPersons[0]._id);
      expect(logger.error).toHaveBeenCalledTimes(1);
    });
  });
});
