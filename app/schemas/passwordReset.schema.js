import Joi from 'joi';

const correo = Joi.string().max(150).pattern(/^\S+$/u).email().required();
const token = Joi.string().length(64).pattern(/^[a-f0-9]+$/u).required();
const contrasena = Joi.string().pattern(/^\S+$/u).min(4).max(72, 'utf8').required();

const forgotPasswordSchema = Joi.object({ correo });
const verifyResetTokenSchema = Joi.object({ token });
const resetPasswordSchema = Joi.object({ token, contrasena });

export { forgotPasswordSchema, verifyResetTokenSchema, resetPasswordSchema };
export default { forgotPasswordSchema, verifyResetTokenSchema, resetPasswordSchema };
