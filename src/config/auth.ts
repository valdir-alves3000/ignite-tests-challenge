import * as dotenv from "dotenv";
dotenv.config();

export default {
  jwt: {
    secret: process.env.JWT_SECRET as string,
    expiresIn: "1d",
  },
};
