const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const crypto = require("crypto");
const morgan = require("morgan");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");

//validation
const { check, validationResult } = require("express-validator");

//pack for reading env
const dotenv = require("dotenv");
dotenv.config();
//port through env var
const PORT = process.env.PORT;

app.use(morgan("dev"));
app.use(express.json());
app.set("view engine", "ejs");
//DESIGN
app.use("/static", express.static(path.join(__dirname, "public")));
app.use(expressLayouts);
app.set("layout", "./layouts/full-width");
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Set up Routers
const loginRouter = require("./routes/login");
app.use("/routes/login", loginRouter);

const indexRouter = require("./routes/index");
app.use("/routes/index", indexRouter);

const logoutRouter = require("./routes/logout");
app.use("/routes/logout", logoutRouter);

const schedulesRouter = require("./routes/schedules");
app.use("/routes/schedules", schedulesRouter);

const signupRouter = require("./routes/signup");
app.use("/routes/signup", signupRouter);

//CHANGE NAME
const scheduleManagerRouter = require("./routes/users");
app.use("/routes/users", scheduleManagerRouter);

//Initialise session
const twoHours = 1000 * 60 * 60 * 2;

app.use(
  session({
    name: "sid",
    resave: true,
    cookie: {
      maxAge: twoHours,
      sameSite: true,
    },
    secret: "shh/its1asecret",
    saveUninitialized: true,
    //secure:false
  })
);

//Add database
const database = require("./database.js");

//Test that connection to PORT is active
app.listen(PORT, () => {
  console.log(`server is listening on ${PORT}`);
});

//Shorthand for pages in the apps

app.use("/login", loginRouter);
app.use("/", indexRouter);
app.use("/logout", logoutRouter);
app.use("/signup", signupRouter);
app.use("/schedules", schedulesRouter);
app.use("/users", scheduleManagerRouter);