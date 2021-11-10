const express = require("express");
const session = require("express-session");
const cors = require("cors");
const path = require("path");
const Sequelize = require("sequelize");
const { Op } = require("sequelize");
const WebSocket = require("ws");
require("dotenv").config();

const onlineUsers = new Map();

const main = async () => {
  const sequelize = new Sequelize("database", "root", "root", {
    dialect: "sqlite",
    storage: "orm-db.sqlite",
  });

  const User = sequelize.define("user", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: Sequelize.STRING,
    password: Sequelize.STRING,
  });

  const Message = sequelize.define("message", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    message_from_user_id: Sequelize.INTEGER,
    message_to_user_id: Sequelize.INTEGER,
    message_text: Sequelize.STRING,
  });

  sequelize.sync({ force: false }).then(() => {
    console.log(`Database & tables created!`);
  });

  const app = express();

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    })
  );

  app.use(express.json());

  const sessionParser = session({
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET,
    resave: false,
  });

  app.use(sessionParser);

  app.use(express.static(path.join(__dirname, process.env.PUBLIC_DIRNAME)));

  //REGISTER FEATURE
  app.post("/api/register", async (req, res) => {
    // check req body
    const name = req.body.name;
    const pswd = req.body.pswd;
    if (!name || !pswd) {
      res.status(400).send({ register: false });
      return;
    }
    // check if the user with this name already exists
    let user = await User.findOne({ where: { name } });
    if (user) {
      res.status(400).send({ register: false });
      return;
    }

    // create user if it is ok
    User.create({ name, password: pswd }).then((u) => {
      req.session.loggedin = true;
      req.session.user_name = name;
      req.session.user_id = u.id;
      res.status(200).send({ register: true });
    });
  });

  app.post("/api/login", async (req, res) => {
    // check req body
    const name = req.body.user_name;
    const pswd = req.body.user_password;
    if (!name || !pswd) {
      res.status(400).send({ loggedin: false });
      return;
    }
    const user = await User.findOne({ where: { name } });
    if (user) {
      if (user.password == pswd) {
        req.session.loggedin = true;
        req.session.user_name = name;
        req.session.user_id = user.id;
        res
          .status(200)
          .json({ loggedin: true, user_name: user.name, user_id: user.id })
          .send();
        return;
      }
    }
    res.status(400).send({ loggedin: false });
  });

  const checkSesssion = (req, res, next) => {
    if (req.session.loggedin) {
      next();
    } else {
      res.send({ loggedin: false });
    }
  };

  app.get("/api/login-test", [
    checkSesssion,
    (_req, res, _next) => {
      res.send({ loggedin: true });
    },
  ]);

  app.get("/api/logout", [
    checkSesssion,
    (req, res, _next) => {
      req.session.loggedin = false;
      res.status(200).send({ loggedin: false });
    },
  ]);

  app.get("/api/users", [
    checkSesssion,
    async (_req, res, _next) => {
      const users = await User.findAll();
      res
        .status(200)
        .json({
          data: users.map((u) => {
            return {
              user_id: u.id,
              user_name: u.name,
              online: onlineUsers.get(u.id) != undefined,
            };
          }),
        })
        .send();
    },
  ]);

  app.post("/api/messages", [
    checkSesssion,
    async (req, res, _next) => {
      const msg = req.body.message_text;
      const msg_id = req.body.message_to_user_id;
      if (!msg || msg_id == undefined) {
        res.status(400).send({ error: "no message or reciever specified!" });
        return;
      }

      const messageBody = {
        message_from_user_id: req.session.user_id,
        message_to_user_id: msg_id,
        message_text: msg,
      };

      Message.create(messageBody)
        .then(() => {
          const ws = onlineUsers.get(msg_id);
          if (ws) {
            ws.send(JSON.stringify(messageBody));
          }
          res.status(200).send("ok");
        })
        .catch((e) => {
          res.status(400).send(e);
        });
    },
  ]);

  app.get("/api/messages/:id", [
    checkSesssion,
    async (req, res, _next) => {
      await Message.findAll({
        where: {
          [Op.or]: [
            {
              message_from_user_id: req.session.user_id,
              message_to_user_id: req.params.id,
            },
            {
              message_from_user_id: req.params.id,
              message_to_user_id: req.session.user_id,
            },
          ],
        },
      })
        .then((msgs) => {
          res.status(200).json(msgs).send();
        })
        .catch((e) => {
          res.status(400).json(e).send();
        });
    },
  ]);

  const server = app.listen(process.env.BACKEND_PORT, () =>
    console.log(`listening on port ${process.env.BACKEND_PORT}`)
  );

  const wss = new WebSocket.Server({ noServer: true });
  server.on("upgrade", (request, socket, head) => {
    sessionParser(request, {}, () => {
      if (!request.session.loggedin) {
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
        return;
      }

      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    });
  });

  wss.on("connection", (ws, req) => {
    const userId = req.session.user_id;
    const userName = req.session.user_name;
    console.log(`WS: connection from: ${userName}.`);

    onlineUsers.forEach((ws, _id) => {
      ws.send(JSON.stringify({ user_id: userId, status: 2 }));
    });

    onlineUsers.set(userId, ws);

    ws.on("message", (msg) => {
      console.log(`WS: ${userName} send: ${msg}`);
    });

    ws.on("close", () => {
      console.log(`WS: ${userName} closed session.`);
      onlineUsers.delete(userId);
      onlineUsers.forEach((ws, _id) => {
        ws.send(JSON.stringify({ user_id: userId, status: 0 }));
      });
    });
  });
};

main().catch((e) => console.error(e));
