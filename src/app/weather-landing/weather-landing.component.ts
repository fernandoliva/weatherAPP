import { Component, OnInit } from '@angular/core';
import { WeatherService } from '../services/weather.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Add Municipality interface at the top with other interfaces
interface Municipality {
  id: string;
  nombre: string;
}

interface CityWeather {
  name: string;
  temperature: number;
  humidity: number;
  condition: string;
  windSpeed: number;
  feelsLike: number;
  icon: string;
  precipitationProb: number;
  uvIndex: number;
}

@Component({
  selector: 'app-weather-landing',
  templateUrl: './weather-landing.component.html',
  styleUrls: ['./weather-landing.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  providers: [WeatherService]
})
export class WeatherLandingComponent implements OnInit {
  searchTerm: string = '';
  cities: CityWeather[] = [];
  filteredMunicipalities: Municipality[] = [];
  municipalities: Municipality[] = [];
  showDropdown = false;
  isLoading = false;
  private searchTimeout: any;

  constructor(private weatherService: WeatherService) {}
  ngOnInit(): void {
    this.loadInitialCities();
    this.loadMunicipalities();
  }
  private loadInitialCities(): void {
    this.weatherService.getAllCitiesWeather().subscribe({
      next: (data: any) => {
        this.cities = [
          this.processWeatherData(data.madrid[0], 'Madrid'),
          this.processWeatherData(data.barcelona[0], 'Barcelona'),
          this.processWeatherData(data.valencia[0], 'Valencia')
        ];
      },
      error: (error: Error) => console.error('Error fetching weather data:', error)
    });
  }
  private loadMunicipalities(): void {
    this.weatherService.getMunicipalities().subscribe({
      next: (data) => {
        this.municipalities = data;
      },
      error: (error) => console.error('Error loading municipalities:', error)
    });
  }
  onSearchInput(): void {
    if (this.searchTerm.length >= 3) {
      this.filteredMunicipalities = this.municipalities.filter(municipality =>
        municipality.nombre.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
      this.showDropdown = true;
    } else if (this.searchTerm.length === 0) {
      this.filteredMunicipalities = [];
      this.showDropdown = false;
      this.loadInitialCities(); // Reload initial cities when search is cleared
    } else {
      this.filteredMunicipalities = [];
      this.showDropdown = false;
    }
  }
  resetSearch(): void {
    this.searchTerm = '';
    this.filteredMunicipalities = [];
    this.showDropdown = false;
    this.loadInitialCities();
  }
  get filteredCities() {
    if (this.searchTerm.length >= 3) {
      return this.cities.filter(city =>
        city.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else if (this.searchTerm.length === 0) {
      return this.cities;
    }
    return [];
  }
  selectMunicipality(municipality: Municipality): void {
    const cityId = municipality.id.replace('id', '');
    this.weatherService.getCityWeatherById(cityId).subscribe({
      next: (data: any) => {
        const newCity = this.processWeatherData(data[0], municipality.nombre);
        this.cities = [newCity];
        this.showDropdown = false;
      },
      error: (error) => console.error('Error fetching city weather:', error)
    });
  }
  private processWeatherData(cityData: any, cityName: string): CityWeather {
    const today = cityData.prediccion.dia[0];
    const currentHour = new Date().getHours();
    const targetPeriod = this.getTimeRange(currentHour);

    // Get current temperature, humidity, and feels-like values
    const currentTemp = this.getCurrentTemperature(today.temperatura);
    const currentHumidity = this.getCurrentHumidity(today.humedadRelativa);
    const currentFeelsLike = this.getCurrentFeelsLike(today.sensTermica);

    // Get precipitation probability for the current period
    const precipProb = today.probPrecipitacion.find((prob: any) => prob.periodo === targetPeriod)?.value || 0;

    return {
      name: cityName,
      temperature: currentTemp || 0,
      humidity: currentHumidity || 0,
      condition: this.getWeatherCondition(today),
      windSpeed: today.viento[0]?.velocidad || 0,
      feelsLike: currentFeelsLike || 0,
      icon: this.getWeatherIcon(today),
      precipitationProb: precipProb,
      uvIndex: today.uvMax || 0
    };
  }
  private getCurrentTemperature(temperatura: any): number {
    const currentHour = new Date().getHours();
    if (currentHour >= 6 && currentHour < 12) return temperatura.dato[0]?.value;
    if (currentHour >= 12 && currentHour < 18) return temperatura.dato[1]?.value;
    if (currentHour >= 18 && currentHour < 24) return temperatura.dato[2]?.value;
    return temperatura.dato[3]?.value; // 00-06
  }
  private getCurrentHumidity(humedad: any): number {
    const currentHour = new Date().getHours();
    if (currentHour >= 6 && currentHour < 12) return humedad.dato[0]?.value;
    if (currentHour >= 12 && currentHour < 18) return humedad.dato[1]?.value;
    if (currentHour >= 18 && currentHour < 24) return humedad.dato[2]?.value;
    return humedad.dato[3]?.value; // 00-06
  }
  private getCurrentFeelsLike(sensTermica: any): number {
    const currentHour = new Date().getHours();
    if (currentHour >= 6 && currentHour < 12) return sensTermica.dato[0]?.value;
    if (currentHour >= 12 && currentHour < 18) return sensTermica.dato[1]?.value;
    if (currentHour >= 18 && currentHour < 24) return sensTermica.dato[2]?.value;
    return sensTermica.dato[3]?.value; // 00-06
  }
  private getTimeRange(hour: number): string {
    if (hour >= 0 && hour < 6) return '00-06';
    if (hour >= 6 && hour < 12) return '06-12';
    if (hour >= 12 && hour < 18) return '12-18';
    return '18-24';
  }
  private getWeatherCondition(day: any): string {
    const currentHour = new Date().getHours();
    const targetPeriod = this.getTimeRange(currentHour);
    const periods = day.estadoCielo;

    const currentPeriod = periods.find((period: any) => period.periodo === targetPeriod);
    return currentPeriod?.descripcion || 'No disponible';
  }
  private getWeatherIcon(day: any): string {
    const currentHour = new Date().getHours();
    const targetPeriod = this.getTimeRange(currentHour);
    const periods = day.estadoCielo;

    const currentPeriod = periods.find((period: any) => period.periodo === targetPeriod);
    const weatherDescription = currentPeriod?.descripcion?.toLowerCase() || '';
    const iconMap: { [key: string]: string } = {
      'despejado': '☀️',
      'poco nuboso': '⛅',
      'nuboso': '☁️',
      'muy nuboso': '☁️',
      'cubierto': '☁️',
      'lluvia': '🌧️',
      'lluvia fuerte': '🌧️',
      'tormenta': '⛈️',
      'intervalos nubosos': '⛅',
      'nubes altas': '🌤️',
      'intervalos de nubes altas': '🌤️',
      'nuboso con lluvia': '🌧️',
      'muy nuboso con lluvia': '🌧️',
      'cubierto con lluvia': '🌧️',
      'nuboso con tormenta': '⛈️',
      'muy nuboso con tormenta': '⛈️',
      'cubierto con tormenta': '🌧️'
    };
    return iconMap[weatherDescription] || '☀️';
  }
}
