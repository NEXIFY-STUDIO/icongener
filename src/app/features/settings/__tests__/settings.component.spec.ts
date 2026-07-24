/**
 * Settings Component Tests
 * Tests for the settings component
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsComponent } from '../settings.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../core/services/toast.service';
import { ToastContainerComponent } from '../../../core/services/toast.service';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    // Create spies for services
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['showToast']);

    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule],
      declarations: [SettingsComponent, ToastContainerComponent],
      providers: [
        { provide: ToastService, useValue: toastServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.selectedLanguage).toBe('en');
    expect(component.selectedTheme).toBe('dark');
  });

  it('should have language options', () => {
    expect(component.languages).toContain('en');
    expect(component.languages).toContain('sk');
  });

  it('should have theme options', () => {
    expect(component.themes).toContain('light');
    expect(component.themes).toContain('dark');
    expect(component.themes).toContain('system');
  });

  it('should change language', () => {
    component.selectedLanguage = 'sk';
    component.onLanguageChange();
    expect(component.selectedLanguage).toBe('sk');
    expect(localStorage.getItem('language')).toBe('sk');
  });

  it('should change theme', () => {
    component.selectedTheme = 'light';
    component.onThemeChange();
    expect(component.selectedTheme).toBe('light');
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('should load saved language from localStorage', () => {
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'language') return 'sk';
      return null;
    });
    
    component = TestBed.createComponent(SettingsComponent).componentInstance;
    expect(component.selectedLanguage).toBe('sk');
  });

  it('should load saved theme from localStorage', () => {
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'theme') return 'light';
      return null;
    });
    
    component = TestBed.createComponent(SettingsComponent).componentInstance;
    expect(component.selectedTheme).toBe('light');
  });

  it('should reset to default settings', () => {
    component.selectedLanguage = 'sk';
    component.selectedTheme = 'light';
    
    component.resetSettings();
    
    expect(component.selectedLanguage).toBe('en');
    expect(component.selectedTheme).toBe('dark');
    expect(localStorage.getItem('language')).toBe('en');
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('should save settings', () => {
    component.selectedLanguage = 'sk';
    component.selectedTheme = 'light';
    
    spyOn(localStorage, 'setItem');
    component.saveSettings();
    
    expect(localStorage.setItem).toHaveBeenCalledWith('language', 'sk');
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light');
    expect(toastServiceSpy.showToast).toHaveBeenCalledWith(
      jasmine.stringContaining('Saved'),
      jasmine.any(String),
      jasmine.any(Number)
    );
  });

  it('should apply theme to document', () => {
    component.selectedTheme = 'light';
    component.applyTheme();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    
    component.selectedTheme = 'dark';
    component.applyTheme();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('should apply language to document', () => {
    component.selectedLanguage = 'en';
    component.applyLanguage();
    expect(document.documentElement.getAttribute('lang')).toBe('en');
    
    component.selectedLanguage = 'sk';
    component.applyLanguage();
    expect(document.documentElement.getAttribute('lang')).toBe('sk');
  });

  it('should get current language', () => {
    component.selectedLanguage = 'en';
    expect(component.getCurrentLanguage()).toBe('en');
    
    component.selectedLanguage = 'sk';
    expect(component.getCurrentLanguage()).toBe('sk');
  });

  it('should get current theme', () => {
    component.selectedTheme = 'dark';
    expect(component.getCurrentTheme()).toBe('dark');
    
    component.selectedTheme = 'light';
    expect(component.getCurrentTheme()).toBe('light');
  });

  it('should check if dark mode is active', () => {
    component.selectedTheme = 'dark';
    expect(component.isDarkMode()).toBe(true);
    
    component.selectedTheme = 'light';
    expect(component.isDarkMode()).toBe(false);
    
    component.selectedTheme = 'system';
    // System theme check depends on actual system preference
    // For testing, we'll just verify it doesn't throw
    expect(component.isDarkMode()).toBeDefined();
  });

  it('should get theme class', () => {
    component.selectedTheme = 'dark';
    expect(component.getThemeClass()).toContain('dark');
    
    component.selectedTheme = 'light';
    expect(component.getThemeClass()).toContain('light');
  });

  it('should get language label', () => {
    expect(component.getLanguageLabel('en')).toBe('English');
    expect(component.getLanguageLabel('sk')).toBe('Slovenský');
  });

  it('should get theme label', () => {
    expect(component.getThemeLabel('light')).toBe('Light');
    expect(component.getThemeLabel('dark')).toBe('Dark');
    expect(component.getThemeLabel('system')).toBe('System');
  });

  it('should have additional settings sections', () => {
    expect(component.additionalSettings.length).toBeGreaterThan(0);
    expect(component.additionalSettings[0]).toHaveProperty('name');
    expect(component.additionalSettings[0]).toHaveProperty('description');
  });

  it('should toggle additional setting', () => {
    const initialValue = component.additionalSettings[0].enabled;
    component.toggleSetting(0);
    expect(component.additionalSettings[0].enabled).toBe(!initialValue);
  });

  it('should get version info', () => {
    const version = component.getVersion();
    expect(version).toBeTruthy();
    expect(typeof version).toBe('string');
  });

  it('should get build date', () => {
    const buildDate = component.getBuildDate();
    expect(buildDate).toBeTruthy();
    expect(typeof buildDate).toBe('string');
  });

  it('should check for updates', () => {
    // This would normally make an HTTP request
    // For testing, we just verify it doesn't throw
    expect(() => component.checkForUpdates()).not.toThrow();
  });

  it('should export settings', () => {
    spyOn(component, 'downloadJson');
    component.exportSettings();
    expect(component.downloadJson).toHaveBeenCalled();
  });

  it('should import settings', () => {
    const mockSettings = {
      language: 'sk',
      theme: 'light'
    };
    
    spyOn(component, 'processImportedSettings');
    const event = { target: { files: [new File([JSON.stringify(mockSettings)], 'settings.json')] } };
    
    component.importSettings(event as any);
    
    expect(component.processImportedSettings).toHaveBeenCalled();
  });

  it('should process imported settings', () => {
    const mockSettings = {
      language: 'sk',
      theme: 'light'
    };
    
    component.processImportedSettings(mockSettings);
    
    expect(component.selectedLanguage).toBe('sk');
    expect(component.selectedTheme).toBe('light');
  });

  it('should handle invalid imported settings', () => {
    const mockSettings = {
      language: 'invalid',
      theme: 'invalid'
    };
    
    component.processImportedSettings(mockSettings);
    
    // Should fall back to defaults
    expect(component.selectedLanguage).toBe('en');
    expect(component.selectedTheme).toBe('dark');
  });

  it('should download JSON file', () => {
    const data = { test: 'data' };
    const filename = 'test.json';
    
    spyOn(document, 'createElement').and.callThrough();
    spyOn(document.body, 'appendChild');
    spyOn(document.body.appendChild as jasmine.Spy, 'click');
    spyOn(document.body, 'removeChild');
    
    component.downloadJson(data, filename);
    
    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(document.body.appendChild).toHaveBeenCalled();
    expect(document.body.removeChild).toHaveBeenCalled();
  });
});
