const { generateSessionId } = require("./utils");
const cors = require("cors");
const app = require("express")().use(cors());

const PORT = 9000;
const sessions = {};

app.get("/login", (req, res) => {
  const { user } = req.headers;

  if (!user) {
    res.status(400).send("error: request must include the 'user' HTTP header");
  } else {
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
