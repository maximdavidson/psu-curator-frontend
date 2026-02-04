import type { InferType } from "yup";
import type { authSchema } from "../schemas/auth.schema";

export type TAuthDto = InferType<typeof authSchema>;
