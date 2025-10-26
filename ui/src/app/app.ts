// Import necessary Angular modules
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms'; // <-- Import FormsModule for ngModel

// Define an interface for our Item (matches the server response)
interface Item {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-root',
  standalone: true, // <-- Mark component as standalone
  imports: [
    RouterOutlet,
    FormsModule, // <-- Add FormsModule for the input
  ],
  templateUrl: `./app.html`,
  styleUrls: [`./app.scss`],
})
export class App implements OnInit {
  httpClient = inject(HttpClient);

  // Base URL for our server
  private apiUrl = 'http://localhost:3000';

  // --- New State Properties ---

  // A signal to hold our array of items
  items = signal<Item[]>([]);

  // A string to hold the value of the new item input (bound with ngModel)
  newItemName = '';

  // The title signal (from your original code)
  protected readonly title = signal('ui');

  ngOnInit(): void {
    // Load the initial list of items when the component starts
    this.getItems();
  }

  /**
   * Fetches all items from the GET /items endpoint
   */
  getItems(): void {
    this.httpClient.get<Item[]>(`${this.apiUrl}/items`)
      .subscribe({
        next: (data) => {
          this.items.set(data); // Set the signal with the fetched data
        },
        error: (err) => {
          console.error('Error fetching items:', err);
        }
      });
  }

  /**
   * Adds a new item using the POST /items endpoint
   */
  addItem(): void {
    const name = this.newItemName.trim();
    if (!name) {
      return; // Don't add if the name is empty
    }

    // Send the POST request
    this.httpClient.post<Item>(`${this.apiUrl}/items`, { name })
      .subscribe({
        next: (newItem) => {
          // Add the new item to our local list
          this.items.update(currentItems => [...currentItems, newItem]);

          // Clear the input field
          this.newItemName = '';
        },
        error: (err) => {
          console.error('Error adding item:', err);
        }
      });
  }
}
