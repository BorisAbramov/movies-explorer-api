require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { celebrate, Joi, errors } = require('celebrate');
const cors = require('cors');
const { SETUP_MONGO, DATABASE } = require('./utils/constans');
const routes = require('./routes/index');
const auth = require('./middlewares/auth');
const { login, createUser } = require('./controllers/users');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const NotFoundError = require('./errors/NotFoundError');
const handleError = require('./errors/handleError');

const { PORT = 3000 } = process.env;
const app = express();
app.use(cors());

mongoose.connect(DATABASE, SETUP_MONGO);

app.use(require('morgan')('dev'));

app.use(express.json());

const limiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 200,
});

app.use(requestLogger);
app.use(helmet());
app.use(limiter);

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

app.use(routes);

app.use('*', (req, res, next) => {
  next(new NotFoundError('Указанный адрес не существует'));
});

app.use(errorLogger);
app.use(errors());

app.use(handleError);

app.listen(PORT);
