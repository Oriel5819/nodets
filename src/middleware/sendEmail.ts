import { createTransport } from "nodemailer";

const transporter = createTransport({
  service: "gmail",
  auth: {
    user: "orielvillam@gmail.com",
    pass: "ibsatylqyjasjrkh",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export { transporter };
