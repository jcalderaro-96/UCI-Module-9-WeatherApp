import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

// Promise-based fs methods for asynchronous file reading and writing
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Define a City class with name and id properties
class City {
  id: string;
  name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}

// Define the file path for storing search history
const HISTORY_FILE_PATH = path.join(__dirname, 'searchHistory.json');

// HistoryService class to handle city history operations
class HistoryService {
  // Read data from the searchHistory.json file
  private async read(): Promise<City[]> {
    try {
      const data = await readFile(HISTORY_FILE_PATH, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading from searchHistory.json:', error);
      return [];
    }
  }

  // Write data to the searchHistory.json file
  private async write(cities: City[]): Promise<void> {
    try {
      await writeFile(HISTORY_FILE_PATH, JSON.stringify(cities, null, 2));
    } catch (error) {
      console.error('Error writing to searchHistory.json:', error);
    }
  }

  // Get all cities from searchHistory.json
  async getCities(): Promise<City[]> {
    const cities = await this.read();
    return cities;
  }

  // Add a new city to the searchHistory.json file
  async addCity(cityName: string): Promise<void> {
    const cities = await this.read();
    const cityId = this.generateCityId(cityName);
    const newCity = new City(cityId, cityName);

    // Check if the city already exists to avoid duplicates
    const existingCity = cities.find(city => city.name === cityName);
    if (!existingCity) {
      cities.push(newCity);
      await this.write(cities);
    }
  }

  // Remove a city from the searchHistory.json file by its ID
  async removeCity(id: string): Promise<void> {
    const cities = await this.read();
    const updatedCities = cities.filter(city => city.id !== id);
    await this.write(updatedCities);
  }

  // Helper method to generate a unique city ID
  private generateCityId(cityName: string): string {
    return `${cityName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
  }
}

export default new HistoryService();
