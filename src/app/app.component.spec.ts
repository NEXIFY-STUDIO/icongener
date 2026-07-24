import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { RouterOutlet } from '@angular/router';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterOutlet],
      declarations: [AppComponent],
      providers: []
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should have title property', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toBe('icongener');
  });

  it('should render main layout', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-main-layout')).toBeTruthy();
  });
});
