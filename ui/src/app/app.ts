import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  httpClient = inject(HttpClient);

  message = '';

  protected readonly title = signal('ui');

  ngOnInit(): void {
    this.httpClient?.get('http://localhost:3000').subscribe((data: any) => {
      this.message = data.message;
    });
  }
}
