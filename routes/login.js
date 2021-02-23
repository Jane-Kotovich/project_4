const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const app = express();
const redis = require("redis");
const session = require("express-session");
const redisStore = require("connect-redis")(session);

const database = require("../database.js");

const redirectHome = (req, res, next) => {
  if (req.session.userId) {
    res.redirect("/");
  } else {
    next();
  }
};
router.get("/", redirectHome, (req, res) => {
  res.render("pages/login", {
    title: "Form page",
  });
});

router.post("/", redirectHome, (req, res) => {
  const password = req.body.psw;
  const passwordEncr = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");
  const currentUser = {
    email: req.body.email,
    psw: passwordEncr,
  };
  console.log(currentUser);

  //this function is now working - checks whether email address and password match

  const query =
    "SELECT email FROM users WHERE email = '" +
    currentUser.email +
    "' AND psw = '" +
    currentUser.psw +
    "' ;";

  const getUserId =
    "SELECT user_id FROM users WHERE email = '" + currentUser.email + "';";
  database
    .any(query)
    .then((result) => {
      if (result.length > 0) {
        database.any(getUserId).then((resultID) => {
          req.session.userId = resultID[0].user_id;
          //req.session.userId = resultUserId;
          return res.redirect("/schedules");
        });
      } else res.send("Error");
    })
    .catch((err) => {
      res.send("error");
    });
});

module.exports = router;