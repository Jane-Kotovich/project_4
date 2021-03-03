//Install relevant packages for main app

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

//Pack for reading environmental variables
const dotenv = require("dotenv");
dotenv.config();
const PORT = process.env.PORT;

//Developer tools
app.use(morgan("dev"));

//Parsing data
app.use(express.json());
app.use(bodyParser.json());

//Design, set up view engine
app.set("view engine", "ejs");
app.use("/static", express.static(path.join(__dirname, "public")));
app.use(expressLayouts);
app.set("layout", "./layouts/full-width");
app.use(express.urlencoded({ extended: true }));

//Set up Routers

//Login
const loginRouter = require("./routes/login");
app.use("/routes/login", loginRouter);

//Home page
const indexRouter = require("./routes/index");
app.use("/routes/index", indexRouter);

//Logout
const logoutRouter = require("./routes/logout");
app.use("/routes/logout", logoutRouter);

//New user sign up
const signupRouter = require("./routes/signup");
app.use("/routes/signup", signupRouter);

//Delete user schedule
const deleteRouter = require("./routes/delete");
app.use("/routes/delete", deleteRouter);

//Add user schedule
const scheduleManagerRouter = require("./routes/users");
app.use("/routes/users", scheduleManagerRouter);

//Initialise session data
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
app.use("/users", scheduleManagerRouter);
app.use("/delete", deleteRouter);
