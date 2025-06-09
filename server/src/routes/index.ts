import { Router } from 'express'; // Import the Router class from Express
const router = Router(); // Initialize a new router instance

// Import the API routes and HTML routes modules
import apiRoutes from './api/index.js'; // Routes for API endpoints
import htmlRoutes from './htmlRoutes.js'; // Routes for serving HTML files

// Use the '/api' prefix for all API-related routes
router.use('/api', apiRoutes);

// Use the root ('/') path for handling HTML routes
router.use('/', htmlRoutes);

// Export the configured router to be used in other parts of the application
export default router;
