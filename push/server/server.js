const { generateSessionId } = require("./utils");
const cors = require("cors");
const app = require("express")().use(cors());
const WebSocket = require("ws");

const {
  publishSessionInvalidation,
  subscribeToSessionInvalidation,
} = require("./pubsub");

const PORT = 9000;
const sessions = {};

app.get("/login", (req, res) => {
  const { user } = req.headers;

  if (!user) {
    res.status(400).send("error: request must include the 'user' HTTP header");
  } else {
    const existingSession = sessions[user];
    if (existingSession) {
      publishSessionInvalidation(existingSession);
    }
    const sessionId = generateSessionId();
    sessions[user] = sessionId;

    res.send({ sessionId });
  }
});

app.get("/api", (req, res) => {
  const { sessionid } = req.headers;

  if (!sessionid) {
    res.status(401).send("error: no sessionId. Log in at /login");
  } else {
    if (Object.values(sessions).includes(sessionid)) {
      res.send("authenticated");
    } else {
      res.status(401).send("error: invalid session.");
    }
  }
});

app.listen(PORT, () => {
  console.log(`server started on http://localhost:${PORT}`);
});

const wss = new WebSocket.Server({ port: 9001 });

wss.on("connection", (ws) => {
  ws.on("message", (data) => {
    const request = JSON.parse(data);
    if (request.action === "subscribeToSessionInvalidation") {
      const { sessionId } = request.args;
      subscribeToSessionInvalidation(sessionId, () => {
        ws.send(
          JSON.stringify({
            event: "sessionInvalidated",
            args: {
              sessionId,
            },
          })
        );
      });
    }
  });
});
