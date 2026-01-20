import { Component } from '@angular/core';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [],
  templateUrl: './help.html',
  styleUrl: './help.css',
})
export class HelpComponent {
  openLink(linkName: string) {
    alert(`${linkName} page coming soon!`);
  }
}
