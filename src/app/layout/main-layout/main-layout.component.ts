import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzLayoutModule,
    HeaderComponent,
    SidebarComponent
  ],
  template: `
    <nz-layout class="app-layout">
      <nz-sider
        nzCollapsible
        [(nzCollapsed)]="isCollapsed"
        [nzTrigger]="null"
        [nzWidth]="240"
        [nzCollapsedWidth]="80"
        class="app-sider"
      >
        <app-sidebar [isCollapsed]="isCollapsed"></app-sidebar>
      </nz-sider>

      <nz-layout class="main-right-layout">
        <nz-header class="app-header">
          <app-header [(isCollapsed)]="isCollapsed"></app-header>
        </nz-header>

        <nz-content class="app-content">
          <router-outlet></router-outlet>
        </nz-content>
      </nz-layout>
    </nz-layout>
  `,
  styles: [`
    .app-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: row;
    }
    .app-sider {
      position: relative;
      z-index: 100;
      box-shadow: 2px 0 8px 0 rgba(29, 35, 41, 0.05);
    }
    .main-right-layout {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
      background: #f0f2f5;
    }
    .app-header {
      padding: 0;
      height: 64px;
      line-height: normal;
      background: #ffffff;
    }
    .app-content {
      flex: 1;
      overflow-y: auto;
    }
  `]
})
export class MainLayoutComponent {
  isCollapsed = false;
}
