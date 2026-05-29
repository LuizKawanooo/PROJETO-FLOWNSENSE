import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <ng-container [ngSwitch]="name">
        <ng-container *ngSwitchCase="'arrow-back'">
          <path d="M19 12H5" />
          <path d="M12 19 5 12l7-7" />
        </ng-container>

        <ng-container *ngSwitchCase="'water'">
          <path d="M12 3.5s6 6.2 6 11.1a6 6 0 1 1-12 0C6 9.7 12 3.5 12 3.5Z" />
        </ng-container>

        <ng-container *ngSwitchCase="'cloud-upload'">
          <path d="M17.5 18H18a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 8 8.5a4.5 4.5 0 0 0 .5 9H9" />
          <path d="M12 12v8" />
          <path d="m8.5 15.5 3.5-3.5 3.5 3.5" />
        </ng-container>

        <ng-container *ngSwitchCase="'trash'">
          <path d="M4 7h16" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
          <path d="m9 7 1-2h4l1 2" />
          <path d="M6 7l1 14h10l1-14" />
        </ng-container>

        <ng-container *ngSwitchCase="'search'">
          <circle cx="11" cy="11" r="6" />
          <path d="m20 20-4.2-4.2" />
        </ng-container>

        <ng-container *ngSwitchCase="'bar-chart'">
          <path d="M4 20V10" />
          <path d="M10 20V4" />
          <path d="M16 20v-7" />
          <path d="M22 20H2" />
        </ng-container>

        <ng-container *ngSwitchCase="'settings'">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.8 1.8 0 0 0 .36 2l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.8 1.8 0 0 0-2-.36 1.8 1.8 0 0 0-1.1 1.65V21a2 2 0 1 1-4 0v-.09A1.8 1.8 0 0 0 8.7 19.3a1.8 1.8 0 0 0-2 .36l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.8 1.8 0 0 0 .36-2A1.8 1.8 0 0 0 2.58 14H2a2 2 0 1 1 0-4h.09A1.8 1.8 0 0 0 3.7 8.9a1.8 1.8 0 0 0-.36-2l-.06-.06A2 2 0 1 1 6.1 4l.06.06a1.8 1.8 0 0 0 2 .36H8.3A1.8 1.8 0 0 0 9.4 2.78V2a2 2 0 1 1 4 0v.09a1.8 1.8 0 0 0 1.1 1.65 1.8 1.8 0 0 0 2-.36l.06-.06A2 2 0 1 1 19.4 6.1l-.06.06a1.8 1.8 0 0 0-.36 2v.14a1.8 1.8 0 0 0 1.65 1.1H21a2 2 0 1 1 0 4h-.09A1.8 1.8 0 0 0 19.4 15Z" />
        </ng-container>

        <ng-container *ngSwitchCase="'chevron-up'">
          <path d="m18 15-6-6-6 6" />
        </ng-container>

        <ng-container *ngSwitchCase="'chevron-down'">
          <path d="m6 9 6 6 6-6" />
        </ng-container>

        <ng-container *ngSwitchCase="'swap-horizontal'">
          <path d="M7 7h11" />
          <path d="m15 4 3 3-3 3" />
          <path d="M17 17H6" />
          <path d="m9 14-3 3 3 3" />
        </ng-container>

        <ng-container *ngSwitchCase="'camera'">
          <path d="M4 8h4l2-3h4l2 3h4v11H4Z" />
          <circle cx="12" cy="13.5" r="3.5" />
        </ng-container>

        <ng-container *ngSwitchCase="'checkmark'">
          <path d="m5 12 4 4L19 6" />
        </ng-container>

        <ng-container *ngSwitchCase="'pencil'">
          <path d="m4 20 4.2-1 10.9-10.9a2.2 2.2 0 0 0-3.1-3.1L5.1 15.9 4 20Z" />
          <path d="m14.5 6.5 3 3" />
        </ng-container>

        <ng-container *ngSwitchCase="'close'">
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </ng-container>

        <ng-container *ngSwitchCase="'log-out'">
          <path d="M10 17l5-5-5-5" />
          <path d="M15 12H3" />
          <path d="M21 19V5a2 2 0 0 0-2-2h-5" />
        </ng-container>

        <ng-container *ngSwitchCase="'eye'">
          <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
          <circle cx="12" cy="12" r="3" />
        </ng-container>

        <ng-container *ngSwitchCase="'eye-off'">
          <path d="m3 3 18 18" />
          <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
          <path d="M9.9 4.2A11.2 11.2 0 0 1 12 4c6 0 9.5 8 9.5 8a16.8 16.8 0 0 1-3.3 4.2" />
          <path d="M6.1 6.1C3.8 7.7 2.5 12 2.5 12S6 20 12 20a10.8 10.8 0 0 0 3.1-.4" />
        </ng-container>
      </ng-container>
    </svg>
  `,
  styles: [`
    :host {
      display: inline-flex;
      width: 1em;
      height: 1em;
      flex: 0 0 auto;
      color: inherit;
    }

    svg {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class AppIconComponent {
  @Input() name = '';
}
