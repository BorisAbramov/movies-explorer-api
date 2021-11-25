const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  updateUser,
  getDataUser,
} = require('../controllers/users');

router.get('/users/me', getDataUser);
router.patch('/users/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).required(),
    email: Joi.string().email().required(),
  }),
}), updateUser);

module.exports = router;
