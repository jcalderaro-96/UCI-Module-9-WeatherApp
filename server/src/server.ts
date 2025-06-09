import dotenv from 'dotenv'; // Load environment variables from .env file
import express from 'express'; // Import Express framework for handling requests
import path from 'path'; // Node.js module for resolving file paths

// Initialize environment variables
dotenv.config();

// Import route handlers
import routes from './routes/index.js'; 

const app = express(); // Initialize an Express app

// Set the server port, defaulting to 3001 if not provided in the .env
const PORT = process.env.PORT || 3001;

// Define the path to the client-side dist folder for serving static files
const distPath = path.resolve(process.cwd(), '../client/dist');

// Middleware to serve static files (like images, CSS, JS) from the dist folder
app.use(express.static(distPath));

// Middleware to parse incoming JSON data in the request body
app.use(express.json());

// Middleware to parse incoming URL-encoded data (e.g., form submissions)
app.use(express.urlencoded({ extended: true }));

// Connect API routes to the app
app.use('/', routes); // Route handler for API endpoints

// Fallback route for unmatched requests - serves the index.html from the dist folder
app.use('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html')); // Serve the front-end app (React build) for any other request
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});
