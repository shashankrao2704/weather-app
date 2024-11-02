import {Injectable, Signal, signal, WritableSignal} from '@angular/core';
import {Observable, of} from 'rxjs';

import {HttpClient} from '@angular/common/http';
import {CurrentConditions} from './current-conditions/current-conditions.type';
import {ConditionsAndZip} from './conditions-and-zip.type';
import {Forecast} from './forecasts-list/forecast.type';
import {LocationService} from './location.service';
import {CachingSystemService} from './caching-system.service';
import {catchError, map} from 'rxjs/operators';

@Injectable()
export class WeatherService {

  static URL = 'https://api.openweathermap.org/data/2.5';
  static APPID = '5a4b2d457ecbef9eb2a71e480b947604';
  static ICON_URL = 'https://raw.githubusercontent.com/udacity/Sunshine-Version-2/sunshine_master/app/src/main/res/drawable-hdpi/';
  private currentConditions : WritableSignal<ConditionsAndZip[]> = signal<ConditionsAndZip[]>([]);

  constructor(private locationService: LocationService, private http: HttpClient, private cacheService: CachingSystemService) {
    this.syncWeatherData();
  }

  // Syncs weather data when application opened
  syncWeatherData(): void {
    const locations = this.locationService.getLocations();
    const existingZips = new Set(this.currentConditions().map(condition => condition.zip));

    locations.forEach(zipcode => {
      const conditionsKey = `conditions_${zipcode}`;

      // Check if the location exists as cache
      if (!existingZips.has(zipcode)) {
        const cachedConditions = this.cacheService.get<CurrentConditions>(conditionsKey);

        if (cachedConditions) {
          this.updateCurrentConditions(zipcode, cachedConditions);
        } else {
          this.fetchCurrentConditions(zipcode);
        }
      }
    });
  }

  removeLocation(zipcode: string): void {
    this.locationService.removeLocation(zipcode);
    this.currentConditions.update(conditions =>
        conditions.filter(condition => condition.zip !== zipcode)
    );
  }

  // Makes Api call to fetch current conditions, if error then displays it console otherwise updates the view and ands to the cache
  private fetchCurrentConditions(zipcode: string): void {
    const conditionsKey = `conditions_${zipcode}`;

    this.http.get<CurrentConditions>(`${WeatherService.URL}/weather?zip=${zipcode},us&units=imperial&APPID=${WeatherService.APPID}`)
        .pipe(
            catchError(error => {
              console.error(`Failed to fetch current conditions for ${zipcode}:`, error);
              this.locationService.removeLocation(zipcode);
              return of(null);
            })
        )
        .subscribe(conditions => {
          if (conditions) {
            this.cacheService.set(conditionsKey, conditions, 3000); // example duration for the caching the weather condition
            this.updateCurrentConditions(zipcode, conditions);
          }
        });
  }

  private updateCurrentConditions(zipcode: string, conditions: CurrentConditions): void {
    this.currentConditions.update(current => [
      ...current.filter(item => item.zip !== zipcode),
      { zip: zipcode, data: conditions }
    ]);
  }

  // Makes Api call to fetch 5 day forecasts, if error then displays it console otherwise adds to the cache
  private fetchForecast(zipcode: string): Observable<Forecast> {
    const forecastKey = `forecast_${zipcode}`;

    // Check the cache for forecast data first
    const cachedForecast = this.cacheService.get<Forecast>(forecastKey);
    if (cachedForecast) {
      return of(cachedForecast);
    } else {
      return this.http.get<Forecast>(`${WeatherService.URL}/forecast/daily?zip=${zipcode},us&units=imperial&cnt=5&APPID=${WeatherService.APPID}`)
          .pipe(
              catchError(error => {
                console.error(`Failed to fetch forecast for ${zipcode}:`, error);
                return of(null);
              }),
              map(forecast => {
                if (forecast) {
                  this.cacheService.set(forecastKey, forecast);
                }
                return forecast;
              })
          );
    }
  }

  getCurrentConditions(): Signal<ConditionsAndZip[]> {
    return this.currentConditions.asReadonly();
  }

  getForecast(zipcode: string): Observable<Forecast> {
    return this.fetchForecast(zipcode);
  }

  getWeatherIcon(id: number): string {
    if (id >= 200 && id <= 232)
      return WeatherService.ICON_URL + "art_storm.png";
    else if (id >= 501 && id <= 511)
      return WeatherService.ICON_URL + "art_rain.png";
    else if (id === 500 || (id >= 520 && id <= 531))
      return WeatherService.ICON_URL + "art_light_rain.png";
    else if (id >= 600 && id <= 622)
      return WeatherService.ICON_URL + "art_snow.png";
    else if (id >= 801 && id <= 804)
      return WeatherService.ICON_URL + "art_clouds.png";
    else if (id === 741 || id === 761)
      return WeatherService.ICON_URL + "art_fog.png";
    else
      return WeatherService.ICON_URL + "art_clear.png";
  }
}
