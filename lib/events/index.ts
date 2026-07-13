import { eventBus, EVENTS } from "@/lib/event-bus";

// Import listeners to ensure they register themselves with the eventBus on application startup.
import "@/lib/listeners/notification.listener";
import "@/lib/listeners/email.listener";
import "@/lib/listeners/activity.listener";

export { eventBus, EVENTS };
