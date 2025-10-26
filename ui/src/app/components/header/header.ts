import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgbCollapse } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, NgbCollapse],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  isMenuCollapsed = true;
}
