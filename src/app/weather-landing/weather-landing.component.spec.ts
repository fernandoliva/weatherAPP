import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeatherLandingComponent } from './weather-landing.component';

describe('WeatherLandingComponent', () => {
  let component: WeatherLandingComponent;
  let fixture: ComponentFixture<WeatherLandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeatherLandingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeatherLandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
