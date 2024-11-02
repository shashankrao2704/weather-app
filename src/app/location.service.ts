import {Injectable, signal, WritableSignal} from '@angular/core';

export const LOCATIONS : string = "locations";

@Injectable()
export class LocationService {

  private locations : WritableSignal<string[]>  = signal([]);

  constructor() {
    let locString = localStorage.getItem(LOCATIONS);
    // Checks if locSting is undefined even when local storage returns it as string
    if (locString && locString !== 'undefined') {
      this.locations.set(JSON.parse(locString));
    }
  }

  getLocations(): string[] {
    return this.locations();
  }

  // check if location already exists
  hasLocation(zipcode: string): boolean {
    return this.locations().includes(zipcode);
  }

  // checks if location already exists otherwise adds to the local storage
  addLocation(zipcode : string) {
    if (!this.hasLocation(zipcode)) {
      this.locations.set([...this.locations(), zipcode]);
      localStorage.setItem(LOCATIONS, JSON.stringify(this.locations()));
    }
  }

  // removes location from the local storage
  removeLocation(zipcode : string) {
    this.locations.set(this.locations().filter(loc => loc !== zipcode));
    localStorage.setItem(LOCATIONS, JSON.stringify(this.locations()));
  }
}
