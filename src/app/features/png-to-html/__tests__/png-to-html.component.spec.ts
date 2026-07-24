/**
 * PNG to HTML Component Tests
 * Tests for the PNG to HTML generator component
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PngToHtmlComponent } from '../png-to-html.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../../core/services/ai.service';
import { DownloadService } from '../../../core/services/download.service';
import { ProgressService } from '../../../core/services/progress.service';
import { ToastService } from '../../../core/services/toast.service';
import { ToastContainerComponent } from '../../../core/services/toast.service';

describe('PngToHtmlComponent', () => {
  let component: PngToHtmlComponent;
  let fixture: ComponentFixture<PngToHtmlComponent>;
  let aiServiceSpy: jasmine.SpyObj<AiService>;
  let downloadServiceSpy: jasmine.SpyObj<DownloadService>;
  let progressServiceSpy: jasmine.SpyObj<ProgressService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    // Create spies for services
    aiServiceSpy = jasmine.createSpyObj('AiService', ['generateSvg', 'cleanSvgCode']);
    downloadServiceSpy = jasmine.createSpyObj('DownloadService', ['downloadPng', 'downloadSvg', 'downloadZip', 'downloadHtml']);
    progressServiceSpy = jasmine.createSpyObj('ProgressService', ['startProgress', 'incrementProgress', 'completeProgress']);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['showToast']);

    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule],
      declarations: [PngToHtmlComponent, ToastContainerComponent],
      providers: [
        { provide: AiService, useValue: aiServiceSpy },
        { provide: DownloadService, useValue: downloadServiceSpy },
        { provide: ProgressService, useValue: progressServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PngToHtmlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.colorQuantization).toBe(16);
    expect(component.outputFormat).toBe('html');
    expect(component.showCrop).toBe(false);
    expect(component.cropX).toBe(0);
    expect(component.cropY).toBe(0);
    expect(component.cropWidth).toBe(100);
    expect(component.cropHeight).toBe(100);
  });

  it('should have color quantization options', () => {
    const expectedOptions = [2, 4, 8, 16, 32, 64, 128, 256];
    expect(component.quantizationOptions).toEqual(expectedOptions);
  });

  it('should have output format options', () => {
    expect(component.formatOptions).toContain('html');
    expect(component.formatOptions).toContain('css');
    expect(component.formatOptions).toContain('svg');
  });

  it('should handle file selection', () => {
    const mockFile = new File([''], 'test.png', { type: 'image/png' });
    const event = { target: { files: [mockFile] } };
    
    spyOn(component, 'processImage');
    component.onFileSelected(event as any);
    
    expect(component.processImage).toHaveBeenCalledWith(mockFile);
  });

  it('should handle drag over', () => {
    const event = { preventDefault: jasmine.createSpy(), stopPropagation: jasmine.createSpy() };
    component.onDragOver(event as any);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(component.isDragging).toBe(true);
  });

  it('should handle drag leave', () => {
    const event = { preventDefault: jasmine.createSpy(), stopPropagation: jasmine.createSpy() };
    component.onDragLeave(event as any);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(component.isDragging).toBe(false);
  });

  it('should handle drop', () => {
    const event = { 
      preventDefault: jasmine.createSpy(), 
      stopPropagation: jasmine.createSpy(),
      dataTransfer: { files: [new File([''], 'test.png', { type: 'image/png' })] }
    };
    
    spyOn(component, 'processImage');
    component.onDrop(event as any);
    
    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(component.isDragging).toBe(false);
    expect(component.processImage).toHaveBeenCalled();
  });

  it('should update color quantization', () => {
    component.colorQuantization = 32;
    component.onQuantizationChange();
    expect(component.colorQuantization).toBe(32);
  });

  it('should update output format', () => {
    component.outputFormat = 'css';
    component.onFormatChange();
    expect(component.outputFormat).toBe('css');
  });

  it('should toggle crop', () => {
    component.showCrop = false;
    component.toggleCrop();
    expect(component.showCrop).toBe(true);
    
    component.toggleCrop();
    expect(component.showCrop).toBe(false);
  });

  it('should update crop values', () => {
    component.cropX = 10;
    component.onCropChange();
    expect(component.cropX).toBe(10);
  });

  it('should reset to default settings', () => {
    component.colorQuantization = 32;
    component.outputFormat = 'css';
    component.showCrop = true;
    component.cropX = 10;
    component.cropY = 20;
    component.cropWidth = 200;
    component.cropHeight = 200;

    component.resetSettings();

    expect(component.colorQuantization).toBe(16);
    expect(component.outputFormat).toBe('html');
    expect(component.showCrop).toBe(false);
    expect(component.cropX).toBe(0);
    expect(component.cropY).toBe(0);
    expect(component.cropWidth).toBe(100);
    expect(component.cropHeight).toBe(100);
  });

  it('should generate HTML when generate is called', async () => {
    // Mock canvas
    component.canvas = document.createElement('canvas');
    component.canvas.width = 100;
    component.canvas.height = 100;
    
    spyOn(component, 'getImageData').and.returnValue(new Uint8ClampedArray(400));
    spyOn(component, 'quantizeColors').and.returnValue([{ r: 0, g: 0, b: 0, a: 255 }]);
    
    await component.generateHtml();
    
    expect(component.getImageData).toHaveBeenCalled();
    expect(component.quantizeColors).toHaveBeenCalled();
    expect(progressServiceSpy.startProgress).toHaveBeenCalled();
    expect(toastServiceSpy.showToast).toHaveBeenCalled();
  });

  it('should handle generation error', async () => {
    component.canvas = null;
    
    await component.generateHtml();
    
    expect(toastServiceSpy.showToast).toHaveBeenCalledWith(
      jasmine.stringContaining('Error'),
      jasmine.any(String),
      jasmine.any(Number)
    );
  });

  it('should download HTML when downloadHtml is called', () => {
    component.generatedCode = '<div>test</div>';
    component.downloadHtml();
    expect(downloadServiceSpy.downloadHtml).toHaveBeenCalledWith('<div>test</div>', 'icon.html');
  });

  it('should copy generated code when copyCode is called', () => {
    component.generatedCode = '<div>test</div>';
    spyOn(navigator.clipboard, 'writeText');
    component.copyCode();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('<div>test</div>');
    expect(toastServiceSpy.showToast).toHaveBeenCalledWith(
      jasmine.stringContaining('Copied'),
      jasmine.any(String),
      jasmine.any(Number)
    );
  });

  it('should handle copy error', () => {
    component.generatedCode = '<div>test</div>';
    spyOn(navigator.clipboard, 'writeText').and.throwError('Copy error');
    component.copyCode();
    expect(toastServiceSpy.showToast).toHaveBeenCalledWith(
      jasmine.stringContaining('Failed'),
      jasmine.any(String),
      jasmine.any(Number)
    );
  });

  it('should crop image when applyCrop is called', () => {
    component.canvas = document.createElement('canvas');
    component.canvas.width = 200;
    component.canvas.height = 200;
    component.cropX = 50;
    component.cropY = 50;
    component.cropWidth = 100;
    component.cropHeight = 100;
    
    spyOn(component, 'updatePreview');
    component.applyCrop();
    
    expect(component.updatePreview).toHaveBeenCalled();
  });

  it('should quantize colors correctly', () => {
    const pixels = new Uint8ClampedArray([
      255, 0, 0, 255,    // Red
      0, 255, 0, 255,    // Green
      0, 0, 255, 255,    // Blue
      255, 255, 255, 255 // White
    ]);
    
    const colors = component.quantizeColors(pixels, 4);
    expect(colors.length).toBeLessThanOrEqual(4);
    expect(colors.length).toBeGreaterThan(0);
  });

  it('should get image data from canvas', () => {
    component.canvas = document.createElement('canvas');
    component.canvas.width = 2;
    component.canvas.height = 2;
    
    const ctx = component.canvas.getContext('2d')!;
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, 0, 2, 2);
    
    const imageData = component.getImageData();
    expect(imageData).toBeTruthy();
    expect(imageData.length).toBe(16); // 2x2 pixels * 4 channels
  });

  it('should create HTML from pixels', () => {
    const pixels = new Uint8ClampedArray([
      255, 0, 0, 255, 0, 255, 0, 255,
      0, 0, 255, 255, 255, 255, 255, 255
    ]);
    
    const colors = [{ r: 255, g: 0, b: 0, a: 255 }];
    const html = component.createHtmlFromPixels(pixels, 2, 2, colors);
    
    expect(html).toContain('<');
    expect(html).toContain('>');
    expect(html.length).toBeGreaterThan(0);
  });

  it('should create CSS from pixels', () => {
    const pixels = new Uint8ClampedArray([
      255, 0, 0, 255, 0, 255, 0, 255,
      0, 0, 255, 255, 255, 255, 255, 255
    ]);
    
    const colors = [{ r: 255, g: 0, b: 0, a: 255 }];
    const css = component.createCssFromPixels(pixels, 2, 2, colors);
    
    expect(css).toContain('{');
    expect(css).toContain('}');
    expect(css.length).toBeGreaterThan(0);
  });

  it('should create SVG from pixels', () => {
    const pixels = new Uint8ClampedArray([
      255, 0, 0, 255, 0, 255, 0, 255,
      0, 0, 255, 255, 255, 255, 255, 255
    ]);
    
    const colors = [{ r: 255, g: 0, b: 0, a: 255 }];
    const svg = component.createSvgFromPixels(pixels, 2, 2, colors);
    
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg.length).toBeGreaterThan(0);
  });
});
