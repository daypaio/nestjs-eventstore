import {
  AcknowledgableEventstoreEvent,
  EventStoreBusConfig, EventStoreEvent,
  EventStoreSubscriptionType,
} from '../../src/index';

export class PersonAddedEvent extends AcknowledgableEventstoreEvent {

}

const PersonEventInstantiators = {
  PersonAddedEvent: (event:EventStoreEvent) =>
    new PersonAddedEvent(event.data, event.meta),
};
/*
const eventBuilderFactory = (type, event) => {
  const className = `${type}Event`;
  return new className(event);
};
*/

export const eventStoreBusConfig: EventStoreBusConfig = {
  subscriptions: [
    {
      type: EventStoreSubscriptionType.Persistent,
      stream: '$ce-persons',
      persistentSubscriptionName: 'contacts',
    },
  ],
  // TODO use a factory that search the events automatically
  eventInstantiators: {
    ...PersonEventInstantiators,
  },
};
