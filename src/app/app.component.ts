import { Component } from '@angular/core';
import { WeatherLandingComponent } from './weather-landing/weather-landing.component';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  template: '<app-weather-landing></app-weather-landing>',
  standalone: true,
  imports: [WeatherLandingComponent, HttpClientModule]
})
export class AppComponent { }
