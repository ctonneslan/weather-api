import dotenv from "dotenv";
dotenv.config();
import { createApp } from "./app.js";
const app = createApp();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`☀️ Weather API is listening on http://localhost:${PORT}`)
);

export default app;
