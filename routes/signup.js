const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const app = express();
const session = require("express-session");

const twoHours = 1000 * 60 * 60 * 2;
const database = require("../database.js");
app.use(
  session({
    name: "sid",
    resave: false,
    cookie: {
      maxAge: twoHours,
      sameSite: true,
    },
    secret: "shh/its1asecret",
    saveUninitialized: false,
    //secure:false
  })
);

//protection from logged in user
const redirectHome = (req, res, next) => {
  if (req.session.userId) {
    res.redirect("/");
  } else {
    next();
  }
};

router.get("/", redirectHome, (req, res) => {
  res.render("pages/signup", {
    title: "Sign up page",
  });
});

router.post(
  "/",
  [
    check("surname").matches(reName).withMessage("must contain only letters"),
    check("firstname").matches(reName).withMessage("must contain only letters"),
    check("email").matches(reMail).withMessage("incorrect email"),
    check("psw")
      .isLength({ min: 5 })
      .withMessage("must be at least 5 chars long"),
  ],
  //check if passwor confitmation same as password
  check("psw").custom((value, { req }) => {
    if (value !== req.body.pswCnf) {
      throw new Error("Password confirmation is incorrect");
    }
    return true;
  }),

  // // check is email taken already I CANNOT DO THAT

  // check("email").custom((req => {

  //    database.any(emailQuery).then((result) => {
  //     if (result) {
  //       return Promise.reject("E-mail already in use");
  //     }
  //   })
  //   return true;
  // }),

  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const emailQuery =
      "SELECT email FROM users WHERE email = '" + req.body.email + "';";

    database.any(emailQuery).then((emailResult) => {
      emailResult = true;
      if (emailResult) {
        console.log(emailResult);
        return res.send("email is taken!");
      }
    });

    //password encryption
    const password = req.body.psw;
    const passwordEncr = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");
    //create new req user
    const newUser = [
      req.body.surname,
      req.body.firstname,
      req.body.email,
      passwordEncr,
    ];
    const newUserName = `${req.body.firstname} ${req.body.surname}`;
    //inserting user into database
    const sql =
      "INSERT INTO users(surname, firstname, email, psw) VALUES ($1, $2, $3, $4)";

    database
      .query(sql, newUser)
      .then((newUsersList) => {
        res.render("pages/confirmation", {
          title: "Confirmation of registration",
          newUserName: newUserName,
        });
      })
      .catch((err) => {
        res.render("pages/error", {
          title: "Error",
          err: err,
        });
      });
  }
);

module.exports = router;