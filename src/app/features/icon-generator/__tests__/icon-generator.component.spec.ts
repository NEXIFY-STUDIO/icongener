/**
 * Icon Generator Component Tests
 * Tests for the icon generator component
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IconGeneratorComponent } from '../icon-generator.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../../core/services/ai.service';
import { DownloadService } from '../../../core/services/download.service';
import { ProgressService } from '../../../core/services/progress.service';
import { ToastService } from '../../../core/services/toast.service';
import { ToastContainerComponent } from '../../../core/services/toast.service';

describe('IconGeneratorComponent', () => {
  let component: IconGeneratorComponent;
  let fixture: ComponentFixture<IconGeneratorComponent>;
  let aiServiceSpy: jasmine.SpyObj<AiService>;
  let downloadServiceSpy: jasmine.SpyObj<DownloadService>;
  let progressServiceSpy: jasmine.SpyObj<ProgressService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    // Create spies for services
    aiServiceSpy = jasmine.createSpyObj('AiService', ['generateSvg', 'cleanSvgCode']);
    downloadServiceSpy = jasmine.createSpyObj('DownloadService', ['downloadPng', 'downloadSvg', 'downloadZip']);
    progressServiceSpy = jasmine.createSpyObj('ProgressService', ['startProgress', 'incrementProgress', 'completeProgress']);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['showToast']);

    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule],
      declarations: [IconGeneratorComponent, ToastContainerComponent],
      providers: [
        { provide: AiService, useValue: aiServiceSpy },
        { provide: DownloadService, useValue: downloadServiceSpy },
        { provide: ProgressService, useValue: progressServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(IconGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.selectedPlatform).toBe('pwa');
    expect(component.selectedShape).toBe('rounded');
    expect(component.iconColor).toBe('#00d4ff');
    expect(component.bgColor).toBe('transparent');
    expect(component.selectedSize).toBe(192);
    expect(component.customPrompt).toBe('');
  });

  it('should have platform options', () => {
    expect(component.platforms).toContain('pwa');
    expect(component.platforms).toContain('android');
    expect(component.platforms).toContain('ios');
  });

  it('should have shape options', () => {
    expect(component.shapes).toContain('circle');
    expect(component.shapes).toContain('rounded');
    expect(component.shapes).toContain('square');
  });

  it('should have PWA sizes', () => {
    expect(component.pwaSizes).toContain(48);
    expect(component.pwaSizes).toContain(192);
    expect(component.pwaSizes).toContain(512);
  });

  it('should have Android sizes', () => {
    expect(component.androidSizes).toContain(36);
    expect(component.androidSizes).toContain(48);
    expect(component.androidSizes).toContain(192);
  });

  it('should have iOS sizes', () => {
    expect(component.iosSizes).toContain(20);
    expect(component.iosSizes).toContain(60);
    expect(component.iosSizes).toContain(180);
  });

  it('should update available sizes when platform changes', () => {
    component.selectedPlatform = 'android';
    component.updateAvailableSizes();
    expect(component.availableSizes).toEqual(component.androidSizes);

    component.selectedPlatform = 'ios';
    component.updateAvailableSizes();
    expect(component.availableSizes).toEqual(component.iosSizes);

    component.selectedPlatform = 'pwa';
    component.updateAvailableSizes();
    expect(component.availableSizes).toEqual(component.pwaSizes);
  });

  it('should update preview when color changes', () => {
    spyOn(component, 'updatePreview');
    component.iconColor = '#ff0000';
    component.onColorChange();
    expect(component.updatePreview).toHaveBeenCalled();
  });

  it('should update preview when shape changes', () => {
    spyOn(component, 'updatePreview');
    component.selectedShape = 'circle';
    component.onShapeChange();
    expect(component.updatePreview).toHaveBeenCalled();
  });

  it('should update preview when size changes', () => {
    spyOn(component, 'updatePreview');
    component.selectedSize = 256;
    component.onSizeChange();
    expect(component.updatePreview).toHaveBeenCalled();
  });

  it('should update preview when platform changes', () => {
    spyOn(component, 'updatePreview');
    component.selectedPlatform = 'android';
    component.onPlatformChange();
    expect(component.updatePreview).toHaveBeenCalled();
  });

  it('should reset to default settings', () => {
    component.selectedPlatform = 'android';
    component.selectedShape = 'circle';
    component.iconColor = '#ff0000';
    component.bgColor = '#000000';
    component.selectedSize = 256;
    component.customPrompt = 'test prompt';

    component.resetSettings();

    expect(component.selectedPlatform).toBe('pwa');
    expect(component.selectedShape).toBe('rounded');
    expect(component.iconColor).toBe('#00d4ff');
    expect(component.bgColor).toBe('transparent');
    expect(component.selectedSize).toBe(192);
    expect(component.customPrompt).toBe('');
  });

  it('should generate icons when generate is called', async () => {
    aiServiceSpy.generateSvg.and.returnValue(Promise.resolve('<svg>test</svg>'));
    downloadServiceSpy.downloadZip.and.returnValue(Promise.resolve());
    
    await component.generateIcons();
    
    expect(aiServiceSpy.generateSvg).toHaveBeenCalled();
    expect(downloadServiceSpy.downloadZip).toHaveBeenCalled();
    expect(progressServiceSpy.startProgress).toHaveBeenCalled();
    expect(toastServiceSpy.showToast).toHaveBeenCalled();
  });

  it('should handle generation error', async () => {
    aiServiceSpy.generateSvg.and.returnValue(Promise.reject('Error'));
    
    await component.generateIcons();
    
    expect(aiServiceSpy.generateSvg).toHaveBeenCalled();
    expect(toastServiceSpy.showToast).toHaveBeenCalledWith(
      jasmine.stringContaining('Error'),
      jasmine.any(String),
      jasmine.any(Number)
    );
  });

  it('should download single icon when downloadIcon is called', () => {
    component.downloadIcon();
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

  it('should get platform sizes correctly', () => {
    const pwaSizes = component.getPlatformSizes('pwa');
    expect(pwaSizes).toEqual(component.pwaSizes);

    const androidSizes = component.getPlatformSizes('android');
    expect(androidSizes).toEqual(component.androidSizes);

    const iosSizes = component.getPlatformSizes('ios');
    expect(iosSizes).toEqual(component.iosSizes);
  });

  it('should have preset prompts', () => {
    expect(component.presetPrompts.length).toBeGreaterThan(0);
    expect(component.presetPrompts[0]).toHaveProperty('name');
    expect(component.presetPrompts[0]).toHaveProperty('prompt');
  });

  it('should select preset correctly', () => {
    const initialPrompt = component.customPrompt;
    component.selectPreset(component.presetPrompts[0].prompt);
    expect(component.customPrompt).toBe(component.presetPrompts[0].prompt);
    expect(component.customPrompt).not.toBe(initialPrompt);
  });
});
