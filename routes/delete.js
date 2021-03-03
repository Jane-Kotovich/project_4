//Define route to delete user schedules

//Install relevant packages

const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const app = express();
//const session = require("express-session");

const database = require("../database.js");

//Delete specific schedule by unique_key field in database

const redirectLogin = (req, res, next) => {
  if (!req.session.userId) {
    res.redirect("/login");
  } else {
    next();
  }
};

router.post("/:scheduleNum", redirectLogin, (req, res) => {
  const scheduleID = req.params.scheduleNum;
  const queryDeleteSchedule = `DELETE FROM schedules WHERE unique_key = '${scheduleID}' `;

  database
    .query(queryDeleteSchedule)
    .then((scheduleTable) => {
      res.redirect("/");
    })
    .catch((err) => {
      res.render("./pages/error", {
        title: "Error",
        err: err.message,
      });
    });
});

module.exports = router;
