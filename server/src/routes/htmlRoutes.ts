// updated server/src/routes/htmlRoutes.ts with green comments
import path from 'node:path'; // Import the path module to work with file and directory paths
import { fileURLToPath } from 'node:url'; // Import to convert import.meta.url to a usable file path
import { Router } from 'express'; // Import Router to define Express routes

const __filename = fileURLToPath(import.meta.url); // Convert import.meta.url to a file path string
const __dirname = path.dirname(__filename); // Get the directory name of the current module file

const router = Router(); // Create a new router instance

// Define GET route to serve the main index.html file from the client build
router.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '../../../client/dist/index.html')); // Send the built HTML file
});

export default router; // Export the router for use in other parts of the app
// end of file
