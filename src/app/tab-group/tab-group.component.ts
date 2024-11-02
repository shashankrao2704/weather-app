import {Component, EventEmitter, Input, Output, TemplateRef} from '@angular/core';

interface TabData {
  id: number;
  zip: string;
  title: string;
  data: any;
}

@Component({
  selector: 'app-tab-group',
  templateUrl: './tab-group.component.html',
  styleUrls: ['./tab-group.component.css']
})
export class TabGroupComponent {
  @Input() contentTemplate!: TemplateRef<any>;
  @Output() closeTabEmitter: EventEmitter<string> = new EventEmitter<string>();
  tabs: TabData[] = [];
  activeTabId: number | null = null;
  private tabIdCounter = 0;

  get activeTab(): TabData | undefined {
    return this.tabs.find(tab => tab.id === this.activeTabId);
  }

  // Clears tabs on page refresh
  clearTabs(): void {
    this.tabs = [];
    this.tabIdCounter = 0;
  }

  // Adds a new tab and makes it active
  addTab(data: any): void {
    const newTab: TabData = {
      id: this.tabIdCounter++,
      zip: data.zip,
      title: data.data.name,
      data
    };
    this.tabs.push(newTab);
    this.activeTabId = newTab.id; // Automatically activate the new tab
  }

  // Removes tab and informs parent component
  removeTab(zipcode: string): void {
    this.tabs = this.tabs.filter(tab => tab.zip !== zipcode);
    this.closeTabEmitter.emit(zipcode);
  }

  // Selects tab to make it active
  selectTab(id: number): void {
    this.activeTabId = id;
  }
}
