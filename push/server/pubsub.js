const { EventEmitter } = require("events");
const sessionEvents = new EventEmitter();

const SESSION_INVALIDATED = "session_invalidated";

function publishSessionInvalidation(sessionId) {
  sessionEvents.emit(SESSION_INVALIDATED, sessionId);
}

function subscribeToSessionInvalidation(sessionId, callback) {
  const listener = (invalidatedSessionId) => {
    if (sessionId === invalidatedSessionId) {
      sessionEvents.removeListener(SESSION_INVALIDATED, listener);
      callback();
    }
  };

  sessionEvents.addListener(SESSION_INVALIDATED, listener);
}

module.exports = {
  publishSessionInvalidation,
  subscribeToSessionInvalidation,
};
