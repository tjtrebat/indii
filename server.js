const createError = require("http-errors");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
const exphbs = require("express-handlebars");
const logger = require("morgan");
const session = require("express-session");
const path = require("path");
const routes = require("./routes");
const passport = require("./config/passport");

const PORT = process.env.PORT || 3001;

const app = express();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/indii";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(logger("dev"));

app.use(express.static("public"));
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: "shhhh, very secret"
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main"
  })
);
app.set("view engine", "handlebars");

app.use(routes);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build/index.html"));
});

app.listen(PORT, function () {
  console.log(`🌎 ==> Server now on port ${PORT}!`);
});
