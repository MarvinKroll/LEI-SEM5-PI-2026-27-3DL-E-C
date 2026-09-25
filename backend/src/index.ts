import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app';

const app = createApp();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🍕 LaPrizza Back-End Server running on http://localhost:${PORT}`);
  console.log(`📖 Swagger API Documentation available at http://localhost:${PORT}/api/docs`);
});
