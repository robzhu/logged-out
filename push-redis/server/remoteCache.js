const redis = require("redis");

const SessionCacheKey = "sessions";
const SessionInvalidationChannel = "sessionInvalidation";
let client;
let subscriber;
const pendingCallbacks = {};

async function connect() {
  client = redis.createClient({
    host: process.env.REDIS_HOST,
    socket_keepalive: true,
  });
  // the redis client we're using works in two modes "normal" and
  // "subscriber". So we duplicate a client here and use that
  // for our subscriptions.
  subscriber = client.duplicate();

  return Promise.all([
    new Promise((resolve) => {
      client.on("ready", resolve);
    }),
    new Promise((resolve) => {
      subscriber.on("ready", () => {
        subscriber.on("message", (channel, invalidatedSession) => {
          if (Object.keys(pendingCallbacks).includes(invalidatedSession)) {
            pendingCallbacks[invalidatedSession]();
            delete pendingCallbacks[invalidatedSession];
          }
        });

        subscriber.subscribe(SessionInvalidationChannel, resolve);
      });
    }),
  ]);
}

async function getSession(userId) {
  return new Promise((resolve) => {
    return client.hmget(SessionCacheKey, userId, (err, res) => {
      resolve(res ? (Array.isArray(res) ? res[0] : res) : null);
    });
  });
}

async function putSession(userId, sessionId) {
  return new Promise((resolve) => {
    client.hmset(SessionCacheKey, userId, sessionId, (err, res) => {
      resolve(res ? (Array.isArray(res) ? res[0] : res) : null);
    });
  });
}

function publishSessionInvalidation(sessionId) {
  client.publish(SessionInvalidationChannel, sessionId);
}

function subscribeToSessionInvalidation(sessionId, callback) {
  pendingCallbacks[sessionId] = callback;
}

module.exports = {
  connect,
  putSession,
  getSession,
  publishSessionInvalidation,
  subscribeToSessionInvalidation,
};
