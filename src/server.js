import dotenv from "dotenv";
import { createApp } from "./app.js";

dotenv.config();
const app = createApp();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`☀️ Weather API is listening on http://localhost:${PORT}`)
);

export default app;
