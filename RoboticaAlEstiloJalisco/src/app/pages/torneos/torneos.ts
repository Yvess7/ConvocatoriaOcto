import { Component } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-torneos',
  templateUrl: './torneos.html',
})
export class TorneosComponent {
  scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
