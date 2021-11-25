const Movie = require('../models/movie');
const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');

const getMovies = async (req, res, next) => {
  const owner = req.user._id;
  try {
    res.send(await Movie.find({ owner }));
  } catch (err) {
    next(err);
  }
};

const createMovie = async (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  } = req.body;
  const owner = req.user._id;
  try {
    res.send(await Movie.create({
      country,
      director,
      duration,
      year,
      description,
      image,
      trailer,
      nameRU,
      nameEN,
      thumbnail,
      movieId,
      owner,
    }));
  } catch (err) {
    if (err.name === 'ValidationError') {
      next(new BadRequestError(`Переданы некорректные данные при создании карточки.
      В поле ${err.message.replace('movie validation failed: ', '')}`));
    }
    next(err);
  }
};

const deleteMovie = async (req, res, next) => {
  try {
    const owner = req.user._id;
    const movie = await Movie.findById(req.params.movieId);
    if (!movie) {
      throw new NotFoundError('Фильм с указанным id не найдена');
    }
    if (owner === movie.owner.toString()) {
      await Movie.findByIdAndRemove(req.params.movieId);
      res.send({ message: 'пост удален' });
    }
    throw new ForbiddenError('Вы не можете удалять фильмы других пользователей');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMovies,
  deleteMovie,
  createMovie,
};
