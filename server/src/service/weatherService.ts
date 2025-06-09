import dotenv from 'dotenv';
import axios from 'axios'; // We'll use Axios to make HTTP requests
dotenv.config();

// Interface for the Coordinates object (latitude and longitude)
interface Coordinates {
  lat: number;
  lon: number;
}

// Interface for the Weather object (current weather and forecast)
interface Weather {
  cityName: string;
  date: string;
  icon: string;
  description: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  forecast: Array<{
    date: string;
    icon: string;
    temperature: number;
    windSpeed: number;
    humidity: number;
  }>;
}

class WeatherService {
  // Base URL for OpenWeather API
  private baseURL: string = 'https://api.openweathermap.org/data/2.5';
  private apiKey: string = process.env.OPENWEATHER_API_KEY || '';
  
  // Fetch location data (latitude, longitude) using a city name
  private async fetchLocationData(query: string): Promise<Coordinates | null> {
    try {
      const geocodeQuery = this.buildGeocodeQuery(query);
      const response = await axios.get(geocodeQuery);
      const locationData = response.data[0];
      
      if (locationData) {
        return {
          lat: locationData.lat,
          lon: locationData.lon
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching location data:', error);
      return null;
    }
  }

  // Destructure the location data
  private destructureLocationData(locationData: Coordinates): Coordinates {
    return locationData;
  }

  // Build the query URL for geocoding (to get lat, lon from city name)
  private buildGeocodeQuery(query: string): string {
    return `${this.baseURL}/weather?q=${query}&appid=${this.apiKey}`;
  }

  // Build the weather query URL to get the weather data using coordinates
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseURL}/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}&units=metric`;
  }

  // Fetch and destructure location data
  private async fetchAndDestructureLocationData(query: string): Promise<Coordinates | null> {
    const locationData = await this.fetchLocationData(query);
    if (locationData) {
      return this.destructureLocationData(locationData);
    }
    return null;
  }

  // Fetch weather data for a city based on coordinates
  private async fetchWeatherData(coordinates: Coordinates): Promise<any> {
    try {
      const weatherQuery = this.buildWeatherQuery(coordinates);
      const response = await axios.get(weatherQuery);
      return response.data;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return null;
    }
  }

  // Parse current weather data
  private parseCurrentWeather(response: any): Weather {
    const currentWeather = response.list[0]; // Assuming the first entry is the current weather
    const cityName = response.city.name;
    const date = new Date(currentWeather.dt * 1000).toLocaleDateString();
    const icon = currentWeather.weather[0].icon;
    const description = currentWeather.weather[0].description;
    const temperature = currentWeather.main.temp;
    const humidity = currentWeather.main.humidity;
    const windSpeed = currentWeather.wind.speed;

    return {
      cityName,
      date,
      icon,
      description,
      temperature,
      humidity,
      windSpeed,
      forecast: [] // Initialize empty forecast array
    };
  }

  // Build the 5-day forecast array
  private buildForecastArray(currentWeather: Weather, weatherData: any[]): Weather['forecast'] {
    const forecast = weatherData.slice(1, 6).map((forecastData: any) => {
      return {
        date: new Date(forecastData.dt * 1000).toLocaleDateString(),
        icon: forecastData.weather[0].icon,
        temperature: forecastData.main.temp,
        windSpeed: forecastData.wind.speed,
        humidity: forecastData.main.humidity
      };
    });
    return forecast;
  }

  // Get weather for a city
  public async getWeatherForCity(city: string): Promise<Weather | null> {
    const coordinates = await this.fetchAndDestructureLocationData(city);
    if (coordinates) {
      const weatherData = await this.fetchWeatherData(coordinates);
      if (weatherData) {
        const currentWeather = this.parseCurrentWeather(weatherData);
        // Now correctly build the forecast array and append it to currentWeather
        currentWeather.forecast = this.buildForecastArray(currentWeather, weatherData.list);
        return currentWeather;
      }
    }
    return null;
  }
}

export default new WeatherService();
