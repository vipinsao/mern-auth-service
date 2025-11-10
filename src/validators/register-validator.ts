import { checkSchema } from "express-validator";

export default checkSchema({
  email: {
    errorMessage: "Email is rquired",
    notEmpty: true,
  },
});

// export default [body("email").notEmpty().withMessage("Email is required")];
