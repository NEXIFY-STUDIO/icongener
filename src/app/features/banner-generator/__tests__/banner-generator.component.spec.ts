/**
 * Banner Generator Component Tests
 * Tests for the banner generator component
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BannerGeneratorComponent } from '../banner-generator.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../../core/services/ai.service';
import { DownloadService } from '../../../core/services/download.service';
import { ProgressService } from '../../../core/services/progress.service';
import { ToastService } from '../../../core/services/toast.service';
import { ToastContainerComponent } from '../../../core/services/toast.service';

describe('BannerGeneratorComponent', () => {
  let component: BannerGeneratorComponent;
  let fixture: ComponentFixture<BannerGeneratorComponent>;
  let aiServiceSpy: jasmine.SpyObj<AiService>;
  let downloadServiceSpy: jasmine.SpyObj<DownloadService>;
  let progressServiceSpy: jasmine.SpyObj<ProgressService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    // Create spies for services
    aiServiceSpy = jasmine.createSpyObj('AiService', ['generateSvg', 'cleanSvgCode', 'enhancePreset']);
    downloadServiceSpy = jasmine.createSpyObj('DownloadService', ['downloadPng', 'downloadSvg', 'downloadZip']);
    progressServiceSpy = jasmine.createSpyObj('ProgressService', ['startProgress', 'incrementProgress', 'completeProgress']);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['showToast']);

    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule],
      declarations: [BannerGeneratorComponent, ToastContainerComponent],
      providers: [
        { provide: AiService, useValue: aiServiceSpy },
        { provide: DownloadService, useValue: downloadServiceSpy },
        { provide: ProgressService, useValue: progressServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BannerGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.width).toBe(1200);
    expect(component.height).toBe(630);
    expect(component.selectedPreset).toBe('Facebook Post');
    expect(component.bgType).toBe('solid');
    expect(component.bgColor).toBe('#00d4ff');
    expect(component.text).toBe('');
    expect(component.textColor).toBe('#ffffff');
  });

  it('should have 25+ presets', () => {
    expect(component.presets.length).toBeGreaterThanOrEqual(25);
  });

  it('should have preset categories', () => {
    expect(component.categories).toContain('Social Media');
    expect(component.categories).toContain('Website');
    expect(component.categories).toContain('Advertising');
  });

  it('should have background types', () => {
    expect(component.bgTypes).toContain('solid');
    expect(component.bgTypes).toContain('gradient');
    expect(component.bgTypes).toContain('image');
    expect(component.bgTypes).toContain('transparent');
  });

  it('should filter presets by category', () => {
    component.selectedCategory = 'Social Media';
    component.filterPresets();
    expect(component.filteredPresets.length).toBeGreaterThan(0);
    
    // All filtered presets should be in Social Media category
    component.filteredPresets.forEach(preset => {
      expect(preset.category).toBe('Social Media');
    });
  });

  it('should select preset and update dimensions', () => {
    const facebookPreset = component.presets.find(p => p.name === 'Facebook Cover');
    if (facebookPreset) {
      component.selectPreset(facebookPreset);
      expect(component.width).toBe(facebookPreset.width);
      expect(component.height).toBe(facebookPreset.height);
      expect(component.selectedPreset).toBe(facebookPreset.name);
    }
  });

  it('should update dimensions when width changes', () => {
    component.width = 800;
    component.onWidthChange();
    expect(component.width).toBe(800);
  });

  it('should update dimensions when height changes', () => {
    component.height = 400;
    component.onHeightChange();
    expect(component.height).toBe(400);
  });

  it('should update preview when background color changes', () => {
    spyOn(component, 'updatePreview');
    component.bgColor = '#ff0000';
    component.onBgColorChange();
    expect(component.updatePreview).toHaveBeenCalled();
  });

  it('should update preview when text changes', () => {
    spyOn(component, 'updatePreview');
    component.text = 'Test Banner';
    component.onTextChange();
    expect(component.updatePreview).toHaveBeenCalled();
  });

  it('should update preview when text color changes', () => {
    spyOn(component, 'updatePreview');
    component.textColor = '#000000';
    component.onTextColorChange();
    expect(component.updatePreview).toHaveBeenCalled();
  });

  it('should reset to default settings', () => {
    component.width = 800;
    component.height = 400;
    component.selectedPreset = 'Twitter Header';
    component.bgType = 'gradient';
    component.bgColor = '#ff0000';
    component.text = 'Test';
    component.textColor = '#000000';

    component.resetSettings();

    expect(component.width).toBe(1200);
    expect(component.height).toBe(630);
    expect(component.selectedPreset).toBe('Facebook Post');
    expect(component.bgType).toBe('solid');
    expect(component.bgColor).toBe('#00d4ff');
    expect(component.text).toBe('');
    expect(component.textColor).toBe('#ffffff');
  });

  it('should generate banner when generate is called', async () => {
    aiServiceSpy.generateSvg.and.returnValue(Promise.resolve('<svg>test</svg>'));
    downloadServiceSpy.downloadPng.and.returnValue(Promise.resolve());
    
    await component.generateBanner();
    
    expect(aiServiceSpy.generateSvg).toHaveBeenCalled();
    expect(downloadServiceSpy.downloadPng).toHaveBeenCalled();
    expect(progressServiceSpy.startProgress).toHaveBeenCalled();
    expect(toastServiceSpy.showToast).toHaveBeenCalled();
  });

  it('should handle generation error', async () => {
    aiServiceSpy.generateSvg.and.returnValue(Promise.reject('Error'));
    
    await component.generateBanner();
    
    expect(aiServiceSpy.generateSvg).toHaveBeenCalled();
    expect(toastServiceSpy.showToast).toHaveBeenCalledWith(
      jasmine.stringContaining('Error'),
      jasmine.any(String),
      jasmine.any(Number)
    );
  });

  it('should download banner when downloadBanner is called', () => {
    component.downloadBanner();
    expect(downloadServiceSpy.downloadPng).toHaveBeenCalled();
  });

  it('should copy SVG code when copySvg is called', () => {
    component.svgCode = '<svg>test</svg>';
    spyOn(navigator.clipboard, 'writeText');
    component.copySvg();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('<svg>test</svg>');
    expect(toastServiceSpy.showToast).toHaveBeenCalledWith(
      jasmine.stringContaining('Copied'),
      jasmine.any(String),
      jasmine.any(Number)
    );
  });

  it('should handle copy error', () => {
    component.svgCode = '<svg>test</svg>';
    spyOn(navigator.clipboard, 'writeText').and.throwError('Copy error');
    component.copySvg();
    expect(toastServiceSpy.showToast).toHaveBeenCalledWith(
      jasmine.stringContaining('Failed'),
      jasmine.any(String),
      jasmine.any(Number)
    );
  });

  it('should get presets by category', () => {
    const socialPresets = component.getPresetsByCategory('Social Media');
    expect(socialPresets.length).toBeGreaterThan(0);
    socialPresets.forEach(preset => {
      expect(preset.category).toBe('Social Media');
    });
  });

  it('should have social media presets', () => {
    const socialPlatforms = ['Facebook', 'Twitter', 'LinkedIn', 'YouTube', 'Instagram'];
    const socialPresets = component.presets.filter(p => 
      socialPlatforms.some(platform => p.name.includes(platform))
    );
    expect(socialPresets.length).toBeGreaterThan(5);
  });

  it('should have website presets', () => {
    const websitePresets = component.presets.filter(p => p.category === 'Website');
    expect(websitePresets.length).toBeGreaterThan(0);
  });

  it('should have advertising presets', () => {
    const adPresets = component.presets.filter(p => p.category === 'Advertising');
    expect(adPresets.length).toBeGreaterThan(0);
  });

  it('should maintain aspect ratio when only width changes', () => {
    const initialRatio = component.width / component.height;
    component.width = 800;
    component.maintainAspectRatio();
    const newRatio = component.width / component.height;
    expect(newRatio).toBeCloseTo(initialRatio, 2);
  });

  it('should maintain aspect ratio when only height changes', () => {
    const initialRatio = component.width / component.height;
    component.height = 400;
    component.maintainAspectRatio();
    const newRatio = component.width / component.height;
    expect(newRatio).toBeCloseTo(initialRatio, 2);
  });
});
