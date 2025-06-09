import dotenv from 'dotenv'; // Load environment variables
import axios from 'axios'; // Axios for making HTTP requests
dotenv.config(); // Initialize dotenv configuration to access API_KEY

// Define interface for the Coordinates object (latitude & longitude)
interface Coordinates {
  lat: number;
  lon: number;
}

// Weather class defines the structure of the weather data we will work with
class Weather {
  constructor(
    public city: string, // Name of the city
    public date: string, // Date of the forecast (formatted)
    public icon: string, // Weather icon code (e.g., '01d' for sunny)
    public iconDescription: string, // Description of the weather icon (e.g., 'clear sky')
    public tempF: number, // Temperature in Fahrenheit
    public windSpeed: number, // Wind speed in miles per hour (mph)
    public humidity: number, // Humidity percentage
  ) {}
}

// WeatherService handles the retrieval and processing of weather data
class WeatherService {
  private apiKey: string; // API key for accessing the OpenWeather API

  // Constructor initializes the API key from environment variables
  constructor() {
    // Read API key from environment, fall back to empty string if not found
    this.apiKey = process.env.API_KEY || '';
  }

  // Method to fetch coordinates (latitude & longitude) for a given city
  private async fetchLocationData(query: string): Promise<Coordinates> {
    try {
      // Fetch coordinates from OpenWeather's geocoding API based on city name
      const response = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=1&appid=${this.apiKey}`
      );

      // Extract lat/lon from the API response and return
      return { lat: response.data[0].lat, lon: response.data[0].lon };
    } catch (error: unknown) {
      // Handle any errors by checking if error is of type 'Error'
      if (error instanceof Error) {
        throw new Error(`Failed to retrieve coordinates for ${query}: ${error.message}`);
      } else {
        throw new Error(`Failed to retrieve coordinates for ${query}: Unknown error`);
      }
    }
  }

  // Method to fetch weather data based on coordinates (latitude & longitude)
  private async fetchWeatherData(coordinates: Coordinates): Promise<any> {
    try {
      // Fetch 5-day weather forecast from OpenWeather API
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}&units=imperial`
      );

      // Return the weather data response
      return response.data;
    } catch (error: unknown) {
      // Handle errors with detailed messages
      if (error instanceof Error) {
        throw new Error(`Failed to retrieve weather data: ${error.message}`);
      } else {
        throw new Error('Failed to retrieve weather data: Unknown error');
      }
    }
  }

  // Method to parse the current weather data from the API response
  private parseCurrentWeather(response: any): Weather {
    // Extract current weather details and return as a Weather object
    return {
      city: response.city.name,
      date: new Date(response.list[0].dt * 1000).toLocaleDateString(), // Convert timestamp to a readable date
      icon: response.list[0].weather[0].icon, // Weather icon code
      iconDescription: response.list[0].weather[0].description, // Icon description (e.g., 'clear sky')
      tempF: response.list[0].main.temp, // Current temperature in Fahrenheit
      windSpeed: response.list[0].wind.speed, // Current wind speed in mph
      humidity: response.list[0].main.humidity, // Current humidity percentage
    };
  }

  // Method to build a 5-day forecast array based on weather data
  private buildForecastArray(currentWeather: Weather, weatherData: any[]): Weather[] {
    // Map over the forecast data to create Weather objects for the next 5 days (excluding today)
    return weatherData.map((item) => ({
      city: currentWeather.city, // Same city as current weather
      date: new Date(item.dt * 1000).toLocaleDateString(), // Convert each forecast timestamp to a date
      icon: item.weather[0].icon, // Weather icon code for the day
      iconDescription: item.weather[0].description, // Weather description (e.g., 'light rain')
      tempF: item.main.temp, // Forecast temperature in Fahrenheit
      windSpeed: item.wind.speed, // Forecast wind speed in mph
      humidity: item.main.humidity, // Forecast humidity percentage
    }));
  }

  // Method to get weather for a city: includes current weather + 5-day forecast
  async getWeatherForCity(city: string): Promise<Weather[]> {
    try {
      // Fetch coordinates for the city (lat/lon)
      const coordinates = await this.fetchLocationData(city);

      // Fetch weather data for the city based on coordinates
      const weatherData = await this.fetchWeatherData(coordinates);

      // Parse the current weather data
      const currentWeather = this.parseCurrentWeather(weatherData);

      // Build the 5-day forecast (excluding the first item which is the current day)
      const forecast = this.buildForecastArray(currentWeather, weatherData.list.slice(1, 6));

      // Return the current weather followed by the forecast
      return [currentWeather, ...forecast];
    } catch (error: unknown) {
      // Handle errors that occur during the process
      if (error instanceof Error) {
        throw new Error(`Failed to retrieve weather data for ${city}: ${error.message}`);
      } else {
        throw new Error(`Failed to retrieve weather data for ${city}: Unknown error`);
      }
    }
  }
}

// Export a new instance of the WeatherService class
export default new WeatherService();