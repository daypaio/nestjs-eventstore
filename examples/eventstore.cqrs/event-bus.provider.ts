import {
  EventStoreBusConfig,
  EventStoreSubscriptionType,
} from 'nestjs-eventstore';

export class PersonAddedEvent {
  constructor(
    public _id: string,
    public data: any,
    public loggedInUserId: string,
  ) { }

  get streamName() {
    // this is the stream name to which the event will be pushed.
    return `persons-${this._id}`;
  }
}

const PersonEventInstantiators = {
  PersonAddedEvent
};

export const eventStoreBusConfig: EventStoreBusConfig = {
  subscriptions: [
    {
      type: EventStoreSubscriptionType.Persistent,
      stream: '$ce-persons',
      persistentSubscriptionName: 'contacts',
    },
  ],
  events: {
    ...PersonEventInstantiators,
  },
};
