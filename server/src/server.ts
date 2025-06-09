// Import environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

// Import core libraries and types
import express, { Request, Response } from 'express';
import path from 'path';

// Import the defined routes
import routes from './routes/index.js';

const app = express();

// Set the port to the value from environment or fallback to 3001
const PORT = process.env.PORT || 3001;

// ✅ Serve static files from the client/dist folder
app.use(express.static(path.resolve('client', 'dist'))); // Serves front-end build files

// ✅ Middleware for parsing JSON and urlencoded form data
app.use(express.json()); // Allows parsing application/json in requests
app.use(express.urlencoded({ extended: true })); // Allows parsing application/x-www-form-urlencoded

// ✅ Connect routes to the application
app.use(routes); // Mounts the API routes under base path

// ✅ Catch-all route to return index.html for client-side routing
app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.resolve('client', 'dist', 'index.html')); // Ensures React/SPA routing works on refresh
});

// ✅ Start the server and log the port
app.listen(PORT, () => console.log(`Listening on PORT: ${PORT}`));
