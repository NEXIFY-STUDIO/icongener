/**
 * Favicon Generator Component Tests
 * Tests for the favicon generator component
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FaviconGeneratorComponent } from '../favicon-generator.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../../core/services/ai.service';
import { DownloadService } from '../../../core/services/download.service';
import { ProgressService } from '../../../core/services/progress.service';
import { ToastService } from '../../../core/services/toast.service';
import { ToastContainerComponent } from '../../../core/services/toast.service';

describe('FaviconGeneratorComponent', () => {
  let component: FaviconGeneratorComponent;
  let fixture: ComponentFixture<FaviconGeneratorComponent>;
  let aiServiceSpy: jasmine.SpyObj<AiService>;
  let downloadServiceSpy: jasmine.SpyObj<DownloadService>;
  let progressServiceSpy: jasmine.SpyObj<ProgressService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    // Create spies for services
    aiServiceSpy = jasmine.createSpyObj('AiService', ['generateSvg', 'cleanSvgCode']);
    downloadServiceSpy = jasmine.createSpyObj('DownloadService', ['downloadPng', 'downloadSvg', 'downloadZip', 'downloadIco']);
    progressServiceSpy = jasmine.createSpyObj('ProgressService', ['startProgress', 'incrementProgress', 'completeProgress']);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['showToast']);

    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule],
      declarations: [FaviconGeneratorComponent, ToastContainerComponent],
      providers: [
        { provide: AiService, useValue: aiServiceSpy },
        { provide: DownloadService, useValue: downloadServiceSpy },
        { provide: ProgressService, useValue: progressServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FaviconGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.selectedSize).toBe(64);
    expect(component.selectedFormat).toBe('png');
    expect(component.iconColor).toBe('#00d4ff');
    expect(component.bgColor).toBe('transparent');
    expect(component.selectedShape).toBe('rounded');
    expect(component.customSvg).toBe('');
  });

  it('should have all standard favicon sizes', () => {
    const expectedSizes = [16, 32, 48, 64, 128, 256, 512];
    expect(component.sizes).toEqual(expectedSizes);
  });

  it('should have format options', () => {
    expect(component.formats).toContain('png');
    expect(component.formats).toContain('ico');
    expect(component.formats).toContain('svg');
  });

  it('should have shape options', () => {
    expect(component.shapes).toContain('circle');
    expect(component.shapes).toContain('rounded');
    expect(component.shapes).toContain('square');
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
    component.selectedSize = 128;
    component.onSizeChange();
    expect(component.updatePreview).toHaveBeenCalled();
  });

  it('should update preview when format changes', () => {
    spyOn(component, 'updatePreview');
    component.selectedFormat = 'ico';
    component.onFormatChange();
    expect(component.updatePreview).toHaveBeenCalled();
  });

  it('should reset to default settings', () => {
    component.selectedSize = 128;
    component.selectedFormat = 'ico';
    component.iconColor = '#ff0000';
    component.bgColor = '#000000';
    component.selectedShape = 'circle';
    component.customSvg = '<svg>test</svg>';

    component.resetSettings();

    expect(component.selectedSize).toBe(64);
    expect(component.selectedFormat).toBe('png');
    expect(component.iconColor).toBe('#00d4ff');
    expect(component.bgColor).toBe('transparent');
    expect(component.selectedShape).toBe('rounded');
    expect(component.customSvg).toBe('');
  });

  it('should generate favicon when generate is called', async () => {
    aiServiceSpy.generateSvg.and.returnValue(Promise.resolve('<svg>test</svg>'));
    downloadServiceSpy.downloadPng.and.returnValue(Promise.resolve());
    
    await component.generateFavicon();
    
    expect(aiServiceSpy.generateSvg).toHaveBeenCalled();
    expect(downloadServiceSpy.downloadPng).toHaveBeenCalled();
    expect(progressServiceSpy.startProgress).toHaveBeenCalled();
    expect(toastServiceSpy.showToast).toHaveBeenCalled();
  });

  it('should generate all sizes when generateAllSizes is called', async () => {
    aiServiceSpy.generateSvg.and.returnValue(Promise.resolve('<svg>test</svg>'));
    downloadServiceSpy.downloadZip.and.returnValue(Promise.resolve());
    
    await component.generateAllSizes();
    
    expect(aiServiceSpy.generateSvg).toHaveBeenCalled();
    expect(downloadServiceSpy.downloadZip).toHaveBeenCalled();
    expect(progressServiceSpy.startProgress).toHaveBeenCalled();
  });

  it('should handle generation error', async () => {
    aiServiceSpy.generateSvg.and.returnValue(Promise.reject('Error'));
    
    await component.generateFavicon();
    
    expect(aiServiceSpy.generateSvg).toHaveBeenCalled();
    expect(toastServiceSpy.showToast).toHaveBeenCalledWith(
      jasmine.stringContaining('Error'),
      jasmine.any(String),
      jasmine.any(Number)
    );
  });

  it('should download favicon when downloadFavicon is called', () => {
    component.downloadFavicon();
    expect(downloadServiceSpy.downloadPng).toHaveBeenCalled();
  });

  it('should download ICO when format is ICO', () => {
    component.selectedFormat = 'ico';
    component.downloadFavicon();
    expect(downloadServiceSpy.downloadIco).toHaveBeenCalled();
  });

  it('should download SVG when format is SVG', () => {
    component.selectedFormat = 'svg';
    component.downloadFavicon();
    expect(downloadServiceSpy.downloadSvg).toHaveBeenCalled();
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

  it('should use custom SVG when provided', () => {
    component.customSvg = '<svg>custom</svg>';
    component.useCustomSvg();
    expect(component.svgCode).toBe('<svg>custom</svg>');
    expect(component.updatePreview).toHaveBeenCalled();
  });

  it('should have preset SVGs', () => {
    expect(component.presetSvgs.length).toBeGreaterThan(0);
    expect(component.presetSvgs[0]).toHaveProperty('name');
    expect(component.presetSvgs[0]).toHaveProperty('svg');
  });

  it('should select preset SVG correctly', () => {
    const initialSvg = component.svgCode;
    component.selectPresetSvg(component.presetSvgs[0].svg);
    expect(component.svgCode).toBe(component.presetSvgs[0].svg);
    expect(component.svgCode).not.toBe(initialSvg);
  });
});
