import {Component, effect, inject, ViewChild} from '@angular/core';
import {TabGroupComponent} from '../tab-group/tab-group.component';
import {WeatherService} from '../weather.service';
import {LocationService} from '../location.service';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html'
})
export class MainPageComponent {
  @ViewChild(TabGroupComponent) tabsComponent!: TabGroupComponent;
  private weatherService = inject(WeatherService);
  private locationService = inject(LocationService);

  constructor() {
    // Monitors changes to current weather conditions, when found then cleans up tab group data and updates it
    effect(() => {
      const conditions = this.weatherService.getCurrentConditions()();
      if (this.tabsComponent) {
        this.tabsComponent.clearTabs(); // Needed to avoid duplicate entries
        conditions.forEach(location => {
          this.tabsComponent.addTab(location);
        });
      }
    });
  }

  // Adds a new location to the storage through weather service and syncs weather data to update the view
  addLocation(zipcode: string): void {
    if (!this.locationService.hasLocation(zipcode)) {
      this.locationService.addLocation(zipcode);
      this.weatherService.syncWeatherData();
    }
  }

  removeTab(zipcode: string): void {
    this.weatherService.removeLocation(zipcode);
  }
}
