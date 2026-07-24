import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LogoComponent } from '../logo/logo.component';
import { DomSanitizer } from '@angular/platform-browser';
import { AiService } from '../../../core/services/ai.service';

describe('LogoComponent', () => {
  let component: LogoComponent;
  let fixture: ComponentFixture<LogoComponent>;
  let mockSanitizer: any;
  let mockAiService: any;

  beforeEach(async () => {
    mockSanitizer = {
      bypassSecurityTrustHtml: jasmine.createSpy('bypassSecurityTrustHtml').and.callFake((html: string) => html)
    };

    mockAiService = {
      generateSvg: jasmine.createSpy('generateSvg').and.returnValue(Promise.resolve('<svg>test</svg>')),
      cleanSvgCode: jasmine.createSpy('cleanSvgCode').and.callFake((code: string) => code)
    };

    await TestBed.configureTestingModule({
      declarations: [LogoComponent],
      providers: [
        { provide: DomSanitizer, useValue: mockSanitizer },
        { provide: AiService, useValue: mockAiService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default size medium', () => {
    expect(component.size()).toBe('medium');
  });

  it('should have default showTitle true', () => {
    expect(component.showTitle()).toBe(true);
  });

  it('should get logo size class', () => {
    component.size.set('small');
    expect(component.getLogoSizeClass()).toContain('w-');
    
    component.size.set('medium');
    expect(component.getLogoSizeClass()).toContain('w-');
    
    component.size.set('large');
    expect(component.getLogoSizeClass()).toContain('w-');
  });

  it('should get title size class', () => {
    component.size.set('small');
    expect(component.getTitleSizeClass()).toContain('text-');
    
    component.size.set('large');
    expect(component.getTitleSizeClass()).toContain('text-');
  });

  it('should get logo title', () => {
    expect(component.getLogoTitle()).toBe('IconGener');
  });

  it('should get fallback SVG', () => {
    const fallbackSvg = component.getFallbackSvg();
    expect(fallbackSvg).toContain('<svg');
    expect(fallbackSvg).toContain('viewBox');
  });

  it('should generate logo on init', () => {
    // The component should attempt to generate logo
    expect(mockAiService.generateSvg).toHaveBeenCalled();
  });

  it('should handle SVG generation error', async () => {
    mockAiService.generateSvg.and.returnValue(Promise.reject(new Error('Test error')));
    
    // Recreate component to trigger error handling
    fixture = TestBed.createComponent(LogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    
    // Should use fallback SVG
    expect(component.generatedSvg()).toBeTruthy();
  });
});
