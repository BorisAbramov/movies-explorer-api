require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { celebrate, Joi, errors } = require('celebrate');
const cors = require('cors');
const usersRouter = require('./routes/users');
const moviesRouter = require('./routes/movies');
const auth = require('./middlewares/auth');
const { login, createUser } = require('./controllers/users');
const NotFoundError = require('./errors/NotFoundError');
const handleError = require('./errors/handleError');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const { PORT = 3000 } = process.env;
const app = express();
app.use(cors());

mongoose.connect('mongodb://localhost:27017/bitfilmsdb', {
  useNewUrlParser: true,
});

app.use(require('morgan')('dev'));

app.use(express.json());

app.use(requestLogger);

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}), login);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
    name: Joi.string().min(2).max(30),
  }),
}), createUser);

app.use(auth);

app.use(moviesRouter);
app.use(usersRouter);

app.use('*', (req, res, next) => {
  next(new NotFoundError('Указанный адрес не существует'));
});

app.use(errorLogger);
app.use(errors());

app.use(handleError);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log('Running');
});
