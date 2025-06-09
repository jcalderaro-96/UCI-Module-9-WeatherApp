import fs from 'node:fs/promises'; // File system promises API for reading and writing files
import { v4 as uuidv4 } from 'uuid'; // UUID library to generate unique identifiers for cities
import path from 'node:path'; // Path library to manage file paths

// Path to the search history file (JSON format)
const HISTORY_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'searchHistory.json');

// Define a City class to represent a city with a name and a unique ID
class City {
  name: string; // City name (e.g., "New York")
  id: string; // Unique identifier for the city

  // Constructor to initialize a new City object
  constructor(name: string, id: string) {
    this.name = name;
    this.id = id;
  }
}

// HistoryService handles reading and writing city search history data from the JSON file
class HistoryService {
  // Private method to read the search history data from the JSON file
  private async read(): Promise<City[]> {
    try {
      // Read the content of the history file as a string
      const data = await fs.readFile(HISTORY_FILE_PATH, 'utf8');
      
      // Parse the JSON string into an array of City objects
      return JSON.parse(data) as City[];
    } catch (error) {
      // If an error occurs while reading, log the error and return an empty array
      console.error('Error reading history file:', error);
      return [];
    }
  }

  // Private method to write updated city data back to the JSON file
  private async write(cities: City[]): Promise<void> {
    try {
      // Convert the cities array to a JSON string and write it to the file
      await fs.writeFile(HISTORY_FILE_PATH, JSON.stringify(cities, null, 2), 'utf-8');
    } catch (error) {
      // Log an error message if writing fails
      console.error('Error writing to history file:', error);
    }
  }

  // Public method to get the list of cities from the history file
  async getCities(): Promise<City[]> {
    // Return the cities by reading the data from the file
    return await this.read();
  }

  // Public method to add a new city to the search history
  async addCity(cityName: string): Promise<void> {
    // Read the existing cities from the history file
    const cities = await this.read();

    // Check if the city already exists (case-insensitive comparison)
    if (cities.some((c) => c.name.toLowerCase() === cityName.toLowerCase())) {
      // If the city already exists, don't add it again
      return;
    }

    // Create a new city object with a unique ID
    const newCity: City = { name: cityName, id: uuidv4() };

    // Add the new city to the cities array
    cities.push(newCity);

    // Write the updated cities array back to the history file
    await this.write(cities);
  }

  // Public method to remove a city from the search history by its ID
  async removeCity(id: string): Promise<void> {
    // Read the current list of cities from the file
    let cities = await this.read();

    // Filter out the city with the specified ID
    cities = cities.filter((city) => city.id !== id);

    // Write the updated cities list back to the file
    await this.write(cities);
  }
}

// Export an instance of the HistoryService class
export default new HistoryService();
