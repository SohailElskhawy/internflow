import { EventEmitter } from "events";

export class EventBus extends EventEmitter {
  private static instance: EventBus;

  private constructor() {
    super();
    this.setMaxListeners(100);
  }

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }
}

export const eventBus = EventBus.getInstance();

export const EVENTS = {
  USER_REGISTERED: "USER_REGISTERED",
  APPLICATION_CREATED: "APPLICATION_CREATED",
  APPLICATION_ACCEPTED: "APPLICATION_ACCEPTED",
  APPLICATION_REJECTED: "APPLICATION_REJECTED",
  APPLICATION_VIEWED: "APPLICATION_VIEWED",
  NEW_INTERNSHIP: "NEW_INTERNSHIP",
} as const;

export type EventType = keyof typeof EVENTS;

export interface EventPayloads {
  [EVENTS.USER_REGISTERED]: {
    userId: string;
    email: string;
    name: string;
    role: string;
  };
  [EVENTS.APPLICATION_CREATED]: {
    applicationId: string;
    studentId: string;
    internshipId: string;
    studentName: string;
    internshipTitle: string;
    companyId: string;
  };
  [EVENTS.APPLICATION_ACCEPTED]: {
    applicationId: string;
    studentId: string;
    internshipId: string;
    studentName: string;
    internshipTitle: string;
    companyId: string;
    companyName: string;
    studentUserId: string;
  };
  [EVENTS.APPLICATION_REJECTED]: {
    applicationId: string;
    studentId: string;
    internshipId: string;
    studentName: string;
    internshipTitle: string;
    companyId: string;
    companyName: string;
    studentUserId: string;
  };
  [EVENTS.APPLICATION_VIEWED]: {
    applicationId: string;
    companyId: string;
    studentUserId: string;
  };
  [EVENTS.NEW_INTERNSHIP]: {
    internshipId: string;
    companyId: string;
    title: string;
    companyName: string;
    location: string;
    type: string;
  };
}
