// Set path for .env file
require('dotenv').config({ path: './sample.env' });
const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');

// Import models
const User = require('./models/user');
const Exercise = require('./models/exercise');

// Create server
const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Allow access to public folder
app.use(express.static('public'));

// GET to '/' returns main page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Parse payload of all POST requests
app.use(bodyParser.urlencoded({ extended: false }));

// POST user object
app.post('/api/users', function(req, res) {
  var user = new User({ username: req.body.username });
  // Save User to DB
  user.save(function(err, data) {
    if (err) {
      res.send('Unique username is required');
    } else {
      // Send confirmation
      res.json(data);
    }
  });
});

// GET list of all user objects
app.get('/api/users', async function(req, res) {
  var users = await User.find();
  res.json(users);
});

// POST exercise object
app.post('/api/users/:_id/exercises', function(req, res) {
  User.findById(req.params._id, function(err, user) {
    if (err) {
      res.send('Incorrect ID');
    } else {
      // Date field is optional
      if (!req.body.date) {
        var date = new Date();
      } else {
        var date = req.body.date;
      }
      // Create an Exercise object
      var exercise = new Exercise({
        username: user.username,
        userId: user._id,
        description: req.body.description,
        duration: req.body.duration,
        date: date
      });
      // Save the Exercise object
      exercise.save(function(err, data) {
        if (err) {
          // TODO improve this error message
          res.send(
            'Check your fields: description must be text, duration must be number, date must be valid'        
          );
        } else {
          data = data.toObject();
          // Send confirmation of save
          res.json({
            ...user.toObject(),
            date: (new Date(data.date)).toDateString(),
            duration: data.duration,
            description: data.description
          });
        }
      });
    }
  });
});

// GET user's exercises
app.get('/api/users/:_id/logs', function(req, res) {
  // Find the user in DB
  User.findById(req.params._id, function(err, user) {
    if (err) {
      res.send('Incorrect ID');
    } else {
      // Handle logs + optional query
      if (!(Object.keys(req.query).length === 0)) {
        // Handle invalid from query
        if (new Date(req.query.from) == 'Invalid Date') {
          var fromDate = 0;
        } else {
          var fromDate = new Date(req.query.from);
        }
        if (new Date(req.query.to) == 'Invalid Date') {
          var toDate = Date.now();
        } else {
          var toDate = new Date(req.query.to);
        }
        // Find this user's exercise logs
        Exercise.find({
          userId: user._id, date: {
            $gte: fromDate,
            $lte: toDate
          }
        })
          .sort({ 'date': -1 })
          .limit(parseInt(req.query.limit))
          .exec(function(err, log) {
            if (err) {
              res.send('Database problem, try again');
            } else {
              // If date query, from/to, is empty, set it to undefined
              if (new Date(req.query.from) == 'Invalid Date') {
                var fDate = undefined;
              } else {
                var fDate = new Date(req.query.from).toDateString();
              }
              if (new Date(req.query.to) == 'Invalid Date') {
                var tDate = undefined;
              } else {
                var tDate = new Date(req.query.to).toDateString();
              }   
              // Send logs of specified date range          
              res.json({
                // JSON -> Object 
                ...user.toObject(),
                from: fDate,
                to: tDate,
                count: log.length,
                log: log.map(function(item) {
                  return {
                    description: item.description,
                    duration: item.duration,
                    date: item.date.toDateString()
                  };
                })
              });
            }
          });
      } else {
        // Handle logs only
        User.findById(req.params._id, function(err, user) {
          if (err) {
            res.send('Incorrect ID');
          } else {
            // Find this user's exercise logs
            Exercise.find({ userId: user._id }, function(err, log) {
              if (err) {
                res.send('Database problem, try again');
              } else {
                // Send all logs
                res.json({
                  // JSON -> Object
                  ...user.toObject(),
                  count: log.length,
                  log: log
                });
              }
            });
          }
        });
      }
    }
  });
});

// Listen for requests
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
