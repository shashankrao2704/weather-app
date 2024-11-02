import {Component, inject, Input, Signal} from '@angular/core';
import {WeatherService} from "../weather.service";
import {LocationService} from "../location.service";
import {Router} from "@angular/router";
import {ConditionsAndZip} from '../conditions-and-zip.type';

@Component({
  selector: 'app-current-conditions',
  templateUrl: './current-conditions.component.html',
  styleUrls: ['./current-conditions.component.css']
})
export class CurrentConditionsComponent {
  @Input() location!: ConditionsAndZip;

  private weatherService = inject(WeatherService);
  private router = inject(Router);

  showForecast(zipcode : string){
    this.router.navigate(['/forecast', zipcode])
  }

  getWeatherIcon (id: number) {
    return this.weatherService.getWeatherIcon(id);
  }
}
