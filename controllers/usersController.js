const db = require("../models");

function getUser(userId) {
  return db.User.findById(userId).populate("videos")
}

function getUserByUsername(username) {
  return db.User.findOne({ username });
}

function createUser(user) {
  return db.User.create(user);
}

function getUserVideos(username, fn) {
  getUserByUsername(
    username
  ).populate("videos").then(
    function (dbUser) {
      fn(null, dbUser.videos);
    }
  ).catch(err => {
    fn(new Error("An error occurred. Error: ", err));
  })
}

function register(username, password, fn) {
  getUserByUsername(
    username
  ).then(
    dbUser => {
      if (dbUser) return fn(new Error("User is already registered."));
      createUser({
        username,
        password
      }).then(user => {
        fn(null, user)
      }).catch(err => {
        fn(new Error("An error occurred. Error: ", err));
      });
    }).catch(err => fn(new Error("An error occurred. Error: ", err)));
}

module.exports = {
  login: function (req, res) {
    res.json(req.user);
  },
  logout: function (req, res) {
    req.logout();
    res.status(200).end();
  },
  register: function (req, res) {
    const { username, password } = req.body;
    register(username, password, (error, user) => {
      if (user) {
        req.logIn(user, err => {
          if (err) throw err;
          res.json(user);
        });
      } else {
        console.log(error);
        res.status(400).end();
      }
    });
  },
  getUserStatus: function (req, res) {
    const user = req.user;
    if (user) {
      getUser(
        user._id
      ).then(function (dbUser) {
        res.json(dbUser);
      }).catch(function (err) {
        console.log(err);
        res.status(500).end();
      });
    } else {
      res.status(401).end();
    }
  },
  getUserVideos: function (req, res) {
    getUserVideos(req.params.username,
      (error, videos) => {
        if (videos) {
          res.json({ videos });
        } else {
          console.log(error);
          res.status(500).end();
        }
      });
  }
};
