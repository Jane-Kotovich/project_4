//Define route for new user sign up

//Install relevant packages

const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const app = express();
const session = require("express-session");
const { check, validationResult } = require("express-validator");

//Define Regex validations for each form field

const reName = /^(([A-za-z]+[\s]{1}[A-za-z]+)|([A-Za-z]+))$/;
const reMail = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;
const rePsw = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm;

//Initialise session data for new user

const twoHours = 1000 * 60 * 60 * 2;
const database = require("../database.js");
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

//User can only sign up as a new user if not currently logged in

const redirectHome = (req, res, next) => {
  if (req.session.userId) {
    res.redirect("/");
  } else {
    next();
  }
};

//Once verified, they are able to access the sign up page

router.get("/", redirectHome, (req, res) => {
  res.render("pages/signup", {
    title: "Sign up page",
  });
});

//Validation checks for each field on the sign-up form

router.post(
  "/",
  [
    check("surname")
      .matches(reName)
      .withMessage("Surname must contain only letters!"),
    check("firstname")
      .matches(reName)
      .withMessage("Name must contain only letters!"),
    check("email").matches(reMail).withMessage("Email has incorrect symbols!"),
    check("psw")
      .matches(rePsw)
      .withMessage(
        "Password must be at least 8 symbols long and include such symbols, as: number, capital and small letters. "
      ),
  ],

  //Check if password confirmation same as the initial password user entered

  check("psw").custom((value, { req }) => {
    if (value !== req.body.pswCnf) {
      throw new Error("Password confirmation is incorrect");
    }
    return true;
  }),

  //If they do not pass the above field validators, alert the user to re-enter certain fields

  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const alert = errors.array();
      res.render("pages/signup", {
        alert,
        title: "Sign up page",
      });
    }
    //Also check if the user tries to sign up with an existing email
    else {
      const emailQuery =
        "SELECT email FROM users WHERE email = '" + req.body.email + "';";

      database
        .many(emailQuery)
        .then((emailResult) => {
          res.send("Sorry, email is taken!"); //Send error if so
        })
        //If new user has entered entered a unique email, start to store the data entered
        .catch((err) => {
          const password = req.body.psw;
          const passwordEncr = crypto
            .createHash("sha256")
            .update(password)
            .digest("hex");
          //Create a new user
          const newUser = [
            req.body.surname,
            req.body.firstname,
            req.body.email,
            passwordEncr,
          ];
          const newUserName = `${req.body.firstname} ${req.body.surname}`;

          //Insert the new user into the database
          const newUserQuery =
            "INSERT INTO users(surname, firstname, email, psw) VALUES ($1, $2, $3, $4)";

          database
            .query(newUserQuery, newUser)
            .then((newUsersList) => {
              res.render("pages/confirmation", {
                title: "Confirmation of registration",
                newUserName: newUserName,
                newUsersList: newUsersList,
              });
            })
            .catch((err) => {
              res.render("pages/error", {
                title: "Error",
                err: err,
              });
            });
        });
    }
  }
);

module.exports = router;
