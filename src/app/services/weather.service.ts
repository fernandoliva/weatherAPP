import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { forkJoin, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

interface Municipality {
  id: string;
  nombre: string;
}

interface AemetResponse {
  descripcion: string;
  estado: number;
  datos: string;
  metadatos: string;
}

interface WeatherData {
  madrid: any[];
  barcelona: any[];
  valencia: any[];
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private apiKey = environment.aemet.apiKey;
  private baseUrl = environment.aemet.baseUrl;

  constructor(private http: HttpClient) {}

  getMunicipalities(): Observable<Municipality[]> {
    const url = `${this.baseUrl}/maestro/municipios?api_key=${this.apiKey}`;
    return this.http.get<AemetResponse>(url).pipe(
      switchMap(response => this.http.get<Municipality[]>(response.datos))
    );
  }

  getCityWeatherById(cityId: string): Observable<any> {
    const url = `${this.baseUrl}/prediccion/especifica/municipio/diaria/${cityId}?api_key=${this.apiKey}`;
    return this.http.get<AemetResponse>(url).pipe(
      switchMap(response => this.http.get(response.datos))
    );
  }

  getCityWeather(cityId: string): Observable<any[]> {
    const url = `${this.baseUrl}/prediccion/especifica/municipio/diaria/${cityId}?api_key=${this.apiKey}`;
    return this.http.get<AemetResponse>(url).pipe(
      switchMap(response => this.http.get<any[]>(response.datos))
    );
  }

  getAllCitiesWeather(): Observable<WeatherData> {
    return forkJoin({
      madrid: this.getCityWeather('28079'),
      barcelona: this.getCityWeather('08019'),
      valencia: this.getCityWeather('46250')
    });
  }
}
