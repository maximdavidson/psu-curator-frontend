import type { InferType } from "yup";
import type { signinSchema, signupFormSchema } from "../schemas/auth.schema";

export type TSignupFormDto = InferType<typeof signupFormSchema>;
export type TSigninFormDto = InferType<typeof signinSchema>;
