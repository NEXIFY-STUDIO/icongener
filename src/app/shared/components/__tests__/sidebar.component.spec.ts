import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { LogoComponent } from '../logo/logo.component';
import { RouterModule } from '@angular/router';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([]), LogoComponent],
      declarations: [SidebarComponent],
      providers: []
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have menu items', () => {
    expect(component.menuItems().length).toBeGreaterThan(0);
  });

  it('should have menu categories', () => {
    expect(component.menuCategories().length).toBeGreaterThan(0);
  });

  it('should get items for category', () => {
    const items = component.getItemsForCategory('generators');
    expect(items.length).toBeGreaterThan(0);
  });

  it('should toggle category', () => {
    const category = component.menuCategories()[0];
    component.toggleCategory(category);
    expect(component.expandedCategories()).toContain(category);
    
    component.toggleCategory(category);
    expect(component.expandedCategories()).not.toContain(category);
  });

  it('should check if category is expanded', () => {
    const category = component.menuCategories()[0];
    expect(component.isCategoryExpanded(category)).toBe(false);
    
    component.toggleCategory(category);
    expect(component.isCategoryExpanded(category)).toBe(true);
  });

  it('should get icon for menu item', () => {
    const item = component.menuItems()[0];
    const icon = component.getIcon(item);
    expect(icon).toBeTruthy();
  });

  it('should get label for menu item', () => {
    const item = component.menuItems()[0];
    const label = component.getLabel(item);
    expect(label).toBeTruthy();
  });

  it('should get path for menu item', () => {
    const item = component.menuItems()[0];
    const path = component.getPath(item);
    expect(path).toBeTruthy();
    expect(path).toContain('/');
  });

  it('should check if item is active', () => {
    component.currentPath.set('/dashboard');
    const dashboardItem = component.menuItems().find(item => item.path === '/dashboard');
    if (dashboardItem) {
      expect(component.isActive(dashboardItem)).toBe(true);
    }
  });

  it('should set current path', () => {
    component.setCurrentPath('/icons');
    expect(component.currentPath()).toBe('/icons');
  });
});
