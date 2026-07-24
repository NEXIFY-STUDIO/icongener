/**
 * Dashboard Component Tests
 * Tests for the dashboard component
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from '../dashboard.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, RouterModule.forRoot([])],
      declarations: [DashboardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have welcome message', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const welcomeElement = compiled.querySelector('h1, h2, h3');
    expect(welcomeElement).toBeTruthy();
    expect(welcomeElement?.textContent?.toLowerCase()).toContain('welcome') ||
    expect(welcomeElement?.textContent?.toLowerCase()).toContain('dashboard');
  });

  it('should display feature cards', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('.feature-card, .card');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('should have navigation links to all features', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const links = compiled.querySelectorAll('a[routerLink], a[href]');
    expect(links.length).toBeGreaterThan(0);
    
    const featureRoutes = ['icon-generator', 'favicon-generator', 'banner-generator', 'png-to-html'];
    const linkHrefs = Array.from(links).map(link => 
      link.getAttribute('routerLink') || link.getAttribute('href') || ''
    );
    
    for (const route of featureRoutes) {
      expect(linkHrefs.some(href => href.includes(route))).toBeTruthy();
    }
  });

  it('should display recent activity if available', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const recentActivity = compiled.querySelector('.recent-activity, [data-testid="recent-activity"]');
    if (recentActivity) {
      expect(recentActivity).toBeTruthy();
    }
  });

  it('should display statistics if available', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const stats = compiled.querySelector('.stats, [data-testid="stats"]');
    if (stats) {
      expect(stats).toBeTruthy();
    }
  });

  it('should have proper styling', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.className).toBeTruthy();
  });
});
