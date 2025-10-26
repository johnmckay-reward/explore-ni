// Import necessary Angular modules
import { Component, Inject, PLATFORM_ID } from '@angular/core'; // Added Inject, PLATFORM_ID
import { RouterOutlet, Router, NavigationEnd } from '@angular/router'; // Added Router, NavigationEnd
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { ToastContainer } from './components/toast-container/toast-container';
import { isPlatformBrowser } from '@angular/common'; // Added isPlatformBrowser
import { filter } from 'rxjs/operators'; // Added filter

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, Footer, ToastContainer],
  templateUrl: `./app.html`,
  styleUrls: [`./app.scss`],
})
export class App {
  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.subscribeToRouteChanges();
  }

  /**
   * Subscribes to router events and scrolls to the top of the page
   * on successful navigation.
   */
  private subscribeToRouteChanges() {
    this.router.events
      .pipe(
        // Filter for the NavigationEnd event
        filter((event): event is NavigationEnd => event instanceof NavigationEnd)
      )
      .subscribe(() => {
        // Check if this code is running in a browser environment
        if (isPlatformBrowser(this.platformId)) {
          // Use window.scrollTo with 'smooth' behavior
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
  }
}
