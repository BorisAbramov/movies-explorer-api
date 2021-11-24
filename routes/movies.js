const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const validator = require('validator');
const {
  getMovies,
  deleteMovie,
  createMovie,
} = require('../controllers/movies');
const BadRequestError = require('../errors/BadRequestError');

const method = (value) => {
  const result = validator.isURL(value);
  if (result) {
    return value;
  }
  throw new BadRequestError('указанный URL не прошел валидацию');
};

router.get('/movies', getMovies);
router.post('/movies', celebrate({
  body: Joi.object().keys({
    country: Joi.string().required().min(2).max(30),
    director: Joi.string().required().min(2).max(30),
    duration: Joi.number().required(),
    year: Joi.number().required(),
    description: Joi.string().required(),
    image: Joi.string().required().custom(method),
    trailer: Joi.string().required().custom(method),
    thumbnail: Joi.string().required().custom(method),
    nameRU: Joi.string().required().min(2).max(30),
    nameEN: Joi.string().required().min(2).max(30),
  }),
}), createMovie);
router.delete('/movies/movieId', celebrate({
  params: Joi.object().keys({
    movieId: Joi.string().hex().length(24),
  }),
}), deleteMovie);

module.exports = router;
