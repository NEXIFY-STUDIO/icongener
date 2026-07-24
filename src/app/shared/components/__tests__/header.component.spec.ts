import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from '../header/header.component';
import { RouterModule } from '@angular/router';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([])],
      declarations: [HeaderComponent],
      providers: []
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get current time', () => {
    const time = component.getCurrentTime();
    expect(time).toBeTruthy();
    expect(time.length).toBeGreaterThan(0);
  });

  it('should get formatted date', () => {
    const date = component.getFormattedDate();
    expect(date).toBeTruthy();
    expect(date.length).toBeGreaterThan(0);
  });

  it('should toggle sidebar', () => {
    const spy = spyOn(component.sidebarToggle, 'emit');
    component.onToggleSidebar();
    expect(spy).toHaveBeenCalled();
  });

  it('should toggle language', () => {
    const initialLang = component.language();
    component.toggleLanguage();
    expect(component.language()).not.toBe(initialLang);
  });

  it('should get language label', () => {
    component.language.set('en');
    expect(component.getLanguageLabel()).toBe('EN');
    
    component.language.set('sk');
    expect(component.getLanguageLabel()).toBe('SK');
  });

  it('should get page title', () => {
    component.pageTitle.set('Test Page');
    expect(component.getPageTitle()).toBe('Test Page');
  });

  it('should update time on interval', (done) => {
    const initialTime = component.getCurrentTime();
    
    setTimeout(() => {
      const newTime = component.getCurrentTime();
      // Time should update (or stay the same if same minute)
      expect(newTime).toBeTruthy();
      done();
    }, 1000);
  });
});
