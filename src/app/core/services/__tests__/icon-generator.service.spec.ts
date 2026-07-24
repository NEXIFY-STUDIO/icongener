import { TestBed } from '@angular/core/testing';
import { IconGeneratorService, PLATFORMS, SHAPES } from '../icon-generator.service';

describe('IconGeneratorService', () => {
  let service: IconGeneratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IconGeneratorService]
    });

    service = TestBed.inject(IconGeneratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have all platforms defined', () => {
    expect(PLATFORMS.length).toBeGreaterThan(0);
    
    const platformIds = PLATFORMS.map(p => p.id);
    expect(platformIds).toContain('pwa');
    expect(platformIds).toContain('android');
    expect(platformIds).toContain('ios');
  });

  it('should have all shapes defined', () => {
    expect(SHAPES.length).toBeGreaterThan(0);
    
    const shapeIds = SHAPES.map(s => s.id);
    expect(shapeIds).toContain('circle');
    expect(shapeIds).toContain('square');
    expect(shapeIds).toContain('rounded');
  });

  it('should get platform by ID', () => {
    const pwaPlatform = service.getPlatform('pwa');
    expect(pwaPlatform).toBeTruthy();
    expect(pwaPlatform?.id).toBe('pwa');
  });

  it('should return undefined for unknown platform', () => {
    const unknownPlatform = service.getPlatform('unknown');
    expect(unknownPlatform).toBeUndefined();
  });

  it('should get shape by ID', () => {
    const circleShape = service.getShape('circle');
    expect(circleShape).toBeTruthy();
    expect(circleShape?.id).toBe('circle');
  });

  it('should return undefined for unknown shape', () => {
    const unknownShape = service.getShape('unknown');
    expect(unknownShape).toBeUndefined();
  });

  it('should clean SVG code', () => {
    const dirtySvg = 'Some text <svg>clean</svg> more text';
    const cleaned = service.cleanSvgCode(dirtySvg);
    expect(cleaned).toBe('<svg>clean</svg>');
  });

  it('should handle null SVG code', () => {
    const cleaned = service.cleanSvgCode(null);
    expect(cleaned).toBe('');
  });

  it('should handle undefined SVG code', () => {
    const cleaned = service.cleanSvgCode(undefined);
    expect(cleaned).toBe('');
  });

  it('should generate fallback SVG', () => {
    const fallbackSvg = service.getFallbackSvg('#00d4ff', '#ffffff');
    expect(fallbackSvg).toContain('<svg');
    expect(fallbackSvg).toContain('#00d4ff');
    expect(fallbackSvg).toContain('#ffffff');
  });

  it('should get all platform IDs', () => {
    const platformIds = service.getAllPlatformIds();
    expect(platformIds.length).toBeGreaterThan(0);
    expect(platformIds).toContain('pwa');
    expect(platformIds).toContain('android');
    expect(platformIds).toContain('ios');
  });

  it('should get all shape IDs', () => {
    const shapeIds = service.getAllShapeIds();
    expect(shapeIds.length).toBeGreaterThan(0);
    expect(shapeIds).toContain('circle');
    expect(shapeIds).toContain('square');
    expect(shapeIds).toContain('rounded');
  });
});
