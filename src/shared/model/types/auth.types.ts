import type { InferType } from "yup";
import type { authSchema } from "../schemas/auth.schema";
// import type { signinSchema, signupFormSchema } from "../schemas/auth.schema";

// export type TSignupFormDto = InferType<typeof signupFormSchema>;
// export type TSigninFormDto = InferType<typeof signinSchema>;

export type TAuthFormDto = InferType<typeof authSchema>;

export type TAuthResponseDto = {
  accessToken: string;
  error: string;
  isSuccess: boolean;
};
