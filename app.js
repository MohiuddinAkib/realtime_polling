const express = require('express'),
  debug = require('debug')('app:heart'),
  morgan = require('morgan'),
  mongoose = require('mongoose'),
  bodyParser = require('body-parser'),
  cors = require('cors'),
  path = require('path'),
  poll = require('./routes/poll'),
  app = express();

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
if (app.get('env') === 'development') {
  app.use(morgan('dev'));
  debug('Morgan enabled...');
}

// Set public folder
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/poll', poll);

// Mongoose
mongoose.Promise = global.Promise;
mongoose.connect(
  process.env.MONGO_URI,
  {
    useFindAndModify: false,
    useCreateIndex: true,
    useNewUrlParser: true
  }
);
// Mongoose error handling
mongoose.connection
  .once('open', () => debug('DB connection established'))
  .on('error', err => debug('DB connection error', err));

// PORT
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => debug(`Server running on port ${PORT}`));
