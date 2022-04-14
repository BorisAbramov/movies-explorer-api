const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const UnauthorizedError = require('../errors/UnauthorizedError');
const ConflictError = require('../errors/ConflictError');

const { NODE_ENV, JWT_SECRET } = process.env;

const getDataUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      throw new NotFoundError('Пользователь по указанному id не найден');
    }
    res.send(user);
  } catch (err) {
    if (err.name === 'CastError') {
      next(new BadRequestError('Указан не валидный номер id пользователя'));
    }
    next(err);
  }
};

const createUser = async (req, res, next) => {
  const {
    email, password, name,
  } = req.body;
  try {
    const hashPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email, password: hashPassword, name,
    });
    res.send({
      user: user.email, name: user.name,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      next(
        new BadRequestError(
          `Переданы некорректные данные при создании пользователя. В поле ${err.message.replace(
            'user validation failed: ',
            '',
          )}`,
        ),
      );
    }
    if (err.code === 11000) {
      next(new ConflictError('Пользователь с таким email уже зарегистрирован'));
    }
    next(err);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new UnauthorizedError('Неправильные почта или пароль');
    }
    const matched = await bcrypt.compare(password, user.password);
    if (!matched) {
      throw new UnauthorizedError('Неправильные почта или пароль');
    }
    const token = jwt.sign(
      { _id: user._id },
      NODE_ENV === 'production' ? JWT_SECRET : 'super-secret-key',
      { expiresIn: '7d' },
    );
    res.send({ token });
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  const { name, email } = req.body;
  try {
    res.send(await User.findByIdAndUpdate(
      req.user._id,
      { name, email },
      {
        new: true,
        runValidators: true,
      },
    ));
  } catch (err) {
	  console.log(err);
	  console.log(JSON.stringify(req.body, null, " "));
    if (err.code === 11000) {
      next(new ConflictError('Пользователь с таким email уже зарегистрирован'));
    }
    next(err);
  }
};

module.exports = {
  updateUser,
  createUser,
  login,
  getDataUser,
};
