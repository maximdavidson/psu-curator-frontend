import type { InferType } from "yup";
import type { authSchema } from "./auth.schema";

export type TAuthDto = InferType<typeof authSchema>;
