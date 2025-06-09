import dotenv from 'dotenv';
dotenv.config();

// TODO: Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}

// TODO: Define a class for the Weather object
class Weather {
  city: string;
  date: string;
  icon: string;
  iconDescription: string;
  tempF: number;
  windSpeed: number;
  humidity: number;

  constructor(
    city: string,
    date: string,
    icon: string,
    iconDescription: string,
    tempF: number,
    windSpeed: number,
    humidity: number
  ) {
    this.city = city;
    this.date = date;
    this.icon = icon;
    this.iconDescription = iconDescription;
    this.tempF = tempF;
    this.windSpeed = windSpeed;
    this.humidity = humidity;
  }
}

class WeatherService {
  // TODO: Define the baseURL, API key, and city name properties
  private baseURL = process.env.API_BASE_URL || 'https://api.openweathermap.org';
  private apiKey = process.env.API_KEY || '';
  private cityName = '';

  // TODO: Create fetchLocationData method
  private async fetchLocationData(query: string): Promise<any> {
    const url = `${this.baseURL}/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=1&appid=${this.apiKey}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error('Failed to fetch location data');
    }
    const data = await res.json();
    if (data.length === 0) {
      throw new Error('No location found');
    }
    return data[0];
  }

  // TODO: Create destructureLocationData method
  private destructureLocationData(locationData: Coordinates): Coordinates {
    return {
      lat: locationData.lat,
      lon: locationData.lon,
    };
  }

  // TODO: Create buildGeocodeQuery method
  private buildGeocodeQuery(): string {
    return `${this.baseURL}/geo/1.0/direct?q=${encodeURIComponent(this.cityName)}&limit=1&appid=${this.apiKey}`;
  }

  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseURL}/data/2.5/onecall?lat=${coordinates.lat}&lon=${coordinates.lon}&units=imperial&appid=${this.apiKey}`;
  }

  // TODO: Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData(city: string): Promise<Coordinates> {
    const locationData = await this.fetchLocationData(city);
    return this.destructureLocationData(locationData);
  }

  // TODO: Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates): Promise<any> {
    const url = this.buildWeatherQuery(coordinates);
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error('Failed to fetch weather data');
    }
    return res.json();
  }

  // TODO: Build parseCurrentWeather method
  private parseCurrentWeather(response: any): Weather {
    const current = response.current;
    const city = this.cityName;
    const date = new Date(current.dt * 1000).toLocaleDateString();
    const icon = current.weather[0].icon;
    const iconDescription = current.weather[0].description;
    const tempF = current.temp;
    const windSpeed = current.wind_speed;
    const humidity = current.humidity;

    return new Weather(city, date, icon, iconDescription, tempF, windSpeed, humidity);
  }

  // TODO: Complete buildForecastArray method
  private buildForecastArray(currentWeather: Weather, weatherData: any[]): Weather[] {
    const forecastArray: Weather[] = [];
    for (let i = 1; i <= 5; i++) {
      const day = weatherData[i];
      const date = new Date(day.dt * 1000).toLocaleDateString();
      const icon = day.weather[0].icon;
      const iconDescription = day.weather[0].description;
      const tempF = day.temp.day;
      const windSpeed = day.wind_speed;
      const humidity = day.humidity;

      forecastArray.push(new Weather(this.cityName, date, icon, iconDescription, tempF, windSpeed, humidity));
    }
    return [currentWeather, ...forecastArray];
  }

  // TODO: Complete getWeatherForCity method
  async getWeatherForCity(city: string): Promise<Weather[]> {
    this.cityName = city;
    const coordinates = await this.fetchAndDestructureLocationData(city);
    const weatherData = await this.fetchWeatherData(coordinates);
    const currentWeather = this.parseCurrentWeather(weatherData);
    return this.buildForecastArray(currentWeather, weatherData.daily);
  }
}

export default new WeatherService();
