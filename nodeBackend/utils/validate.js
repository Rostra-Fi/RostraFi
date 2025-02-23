const Joi = require('joi');
const AppError = require('../utils/appError');
const { MAX_TEAMS_PER_SECTION } = require('../utils/constants');

const schemas = {
  createUserTeam: Joi.object({
    userId: Joi.string().required().trim(),
    teamName: Joi.string().required().trim().min(3).max(50),
    sections: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required().trim(),
          sectionId: Joi.string()
            .required()
            .regex(/^[0-9a-fA-F]{24}$/),
          selectedTeams: Joi.array()
            .items(Joi.string().regex(/^[0-9a-fA-F]{24}$/))
            .max(MAX_TEAMS_PER_SECTION),
        }),
      )
      .required(),
    isActive: Joi.boolean().default(true),
  }),
};

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(', ');
    return next(new AppError(errorMessage, 400));
  }
  next();
};

module.exports = {
  schemas,
  validate,
};
