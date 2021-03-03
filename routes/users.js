//Define route for uers to add new schedules, and display existing schedules

//Install relevant packages

const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const app = express();
const session = require("express-session");

const database = require("../database.js");

//Define specific route for each user based on their database user ID

router.get("/:userNum", (req, res) => {
  const userId = req.params.userNum;

  const queryDisplayCombined = `SELECT users.surname, schedules.unique_key, users.firstname, schedules.week_day, TO_CHAR(schedules.start_at, 'HH:MI am') AS start_at, TO_CHAR(schedules.end_at, 'HH:MI am') as end_at, TO_CHAR(schedules.end_at, 'DD-Month-YYYY') as date FROM users JOIN schedules ON schedules.user_id=users.user_id WHERE users.user_id='${userId}' ORDER BY schedules.end_at;`;

  database
    .any(queryDisplayCombined)
    .then((scheduleTable) => {
      res.render("pages/users", {
        title: "Form page",
        scheduleTable,
      });
    })
    .catch((err) => {
      res.render("./pages/error", {
        title: "Error",
        layout: "./pages/layout",
        err: err.message,
      });
    });
});

//Take in new user schedule

router.post("/", async (req, res) => {
  const { userId } = req.session;

  if (!req.session.userId) {
    let err = {
      message: "Please go back and login before trying to add a schedule",
    };
    res.render("./pages/error", {
      title: "Error",
      err: err,
    });
  } else
    try {
      const schedule = {
        start_at: req.body.starttime,
        end_at: req.body.endtime,
        week_day: parseInt(req.body.day),
        date: req.body.date,
      };

      //Format HTML input as timestamp data so that we can insert into SQL database

      const insertStart = `${schedule.date} ` + `${schedule.start_at}`;
      const insertEnd = `${schedule.date} ` + `${schedule.end_at}`;

      //Insert new user schedule into database

      const queryInsertIntoSchedule =
        "INSERT INTO schedules (user_id, week_day, start_at, end_at) VALUES($1,$2,$3,$4);";
      const Insertschedule = await database.any(queryInsertIntoSchedule, [
        userId,
        schedule.week_day,
        insertStart,
        insertEnd,
      ]);

      // Obtain user data
      const queryUserDisplay = `SELECT * FROM users WHERE user_id = '${userId}' ;`;
      const user = await database.any(queryUserDisplay);

      //Display combined user and schedule data in a formatted way
      const queryDisplayCombined = `SELECT users.surname, schedules.unique_key, users.firstname, schedules.week_day, TO_CHAR(schedules.start_at, 'HH:MI am') AS start_at, TO_CHAR(schedules.end_at, 'HH:MI am') as end_at, TO_CHAR(schedules.end_at, 'DD-Month-YYYY') as date FROM users JOIN schedules ON schedules.user_id=users.user_id WHERE users.user_id='${userId}' ORDER BY schedules.end_at;`;
      database.any(queryDisplayCombined).then((scheduleTable) => {
        res.render("pages/users", {
          title: "Form page",
          scheduleTable,
        });
      });
    } catch (error) {
      console.log(error);
    }
});

module.exports = router;
