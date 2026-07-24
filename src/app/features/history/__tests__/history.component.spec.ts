/**
 * History Component Tests
 * Tests for the history component
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistoryComponent } from '../history.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DownloadService } from '../../../core/services/download.service';
import { ToastService } from '../../../core/services/toast.service';
import { ToastContainerComponent } from '../../../core/services/toast.service';

describe('HistoryComponent', () => {
  let component: HistoryComponent;
  let fixture: ComponentFixture<HistoryComponent>;
  let downloadServiceSpy: jasmine.SpyObj<DownloadService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    // Create spies for services
    downloadServiceSpy = jasmine.createSpyObj('DownloadService', ['downloadPng', 'downloadSvg', 'downloadZip']);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['showToast']);

    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule],
      declarations: [HistoryComponent, ToastContainerComponent],
      providers: [
        { provide: DownloadService, useValue: downloadServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty history if localStorage is empty', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    component = TestBed.createComponent(HistoryComponent).componentInstance;
    expect(component.historyItems).toEqual([]);
  });

  it('should load history from localStorage', () => {
    const mockHistory = [
      { id: '1', type: 'icon', name: 'Test Icon', svg: '<svg>test</svg>', createdAt: Date.now() }
    ];
    spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(mockHistory));
    
    component = TestBed.createComponent(HistoryComponent).componentInstance;
    expect(component.historyItems.length).toBe(1);
    expect(component.historyItems[0].name).toBe('Test Icon');
  });

  it('should filter history by type', () => {
    component.historyItems = [
      { id: '1', type: 'icon', name: 'Icon 1', svg: '<svg>1</svg>', createdAt: Date.now() },
      { id: '2', type: 'favicon', name: 'Favicon 1', svg: '<svg>2</svg>', createdAt: Date.now() },
      { id: '3', type: 'banner', name: 'Banner 1', svg: '<svg>3</svg>', createdAt: Date.now() }
    ];
    
    component.filterType = 'icon';
    component.filterHistory();
    
    expect(component.filteredItems.length).toBe(1);
    expect(component.filteredItems[0].type).toBe('icon');
  });

  it('should filter history by search text', () => {
    component.historyItems = [
      { id: '1', type: 'icon', name: 'Test Icon', svg: '<svg>1</svg>', createdAt: Date.now() },
      { id: '2', type: 'icon', name: 'Another Icon', svg: '<svg>2</svg>', createdAt: Date.now() }
    ];
    
    component.searchText = 'Test';
    component.filterHistory();
    
    expect(component.filteredItems.length).toBe(1);
    expect(component.filteredItems[0].name).toContain('Test');
  });

  it('should filter history by date range', () => {
    const now = Date.now();
    const yesterday = now - 86400000;
    const lastWeek = now - 604800000;
    
    component.historyItems = [
      { id: '1', type: 'icon', name: 'Recent', svg: '<svg>1</svg>', createdAt: now },
      { id: '2', type: 'icon', name: 'Old', svg: '<svg>2</svg>', createdAt: lastWeek }
    ];
    
    component.startDate = new Date(yesterday).toISOString().split('T')[0];
    component.endDate = new Date(now).toISOString().split('T')[0];
    component.filterHistory();
    
    expect(component.filteredItems.length).toBe(1);
    expect(component.filteredItems[0].name).toBe('Recent');
  });

  it('should clear filters', () => {
    component.filterType = 'icon';
    component.searchText = 'test';
    component.startDate = '2024-01-01';
    component.endDate = '2024-12-31';
    
    component.clearFilters();
    
    expect(component.filterType).toBe('all');
    expect(component.searchText).toBe('');
    expect(component.startDate).toBe('');
    expect(component.endDate).toBe('');
  });

  it('should delete history item', () => {
    component.historyItems = [
      { id: '1', type: 'icon', name: 'Icon 1', svg: '<svg>1</svg>', createdAt: Date.now() },
      { id: '2', type: 'icon', name: 'Icon 2', svg: '<svg>2</svg>', createdAt: Date.now() }
    ];
    
    spyOn(localStorage, 'setItem');
    
    component.deleteItem('1');
    
    expect(component.historyItems.length).toBe(1);
    expect(component.historyItems[0].id).toBe('2');
    expect(localStorage.setItem).toHaveBeenCalled();
  });

  it('should delete all history items', () => {
    component.historyItems = [
      { id: '1', type: 'icon', name: 'Icon 1', svg: '<svg>1</svg>', createdAt: Date.now() },
      { id: '2', type: 'icon', name: 'Icon 2', svg: '<svg>2</svg>', createdAt: Date.now() }
    ];
    
    spyOn(localStorage, 'setItem');
    spyOn(window, 'confirm').and.returnValue(true);
    
    component.deleteAll();
    
    expect(component.historyItems.length).toBe(0);
    expect(localStorage.setItem).toHaveBeenCalledWith('history', JSON.stringify([]));
  });

  it('should not delete all if user cancels', () => {
    component.historyItems = [
      { id: '1', type: 'icon', name: 'Icon 1', svg: '<svg>1</svg>', createdAt: Date.now() }
    ];
    
    spyOn(localStorage, 'setItem');
    spyOn(window, 'confirm').and.returnValue(false);
    
    component.deleteAll();
    
    expect(component.historyItems.length).toBe(1);
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it('should download history item', () => {
    component.historyItems = [
      { id: '1', type: 'icon', name: 'Icon 1', svg: '<svg>test</svg>', createdAt: Date.now() }
    ];
    
    component.downloadItem(component.historyItems[0]);
    
    expect(downloadServiceSpy.downloadSvg).toHaveBeenCalledWith('<svg>test</svg>', 'icon-1.svg');
  });

  it('should copy SVG to clipboard', () => {
    const item = { id: '1', type: 'icon', name: 'Icon 1', svg: '<svg>test</svg>', createdAt: Date.now() };
    
    spyOn(navigator.clipboard, 'writeText');
    component.copySvg(item);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('<svg>test</svg>');
    expect(toastServiceSpy.showToast).toHaveBeenCalledWith(
      jasmine.stringContaining('Copied'),
      jasmine.any(String),
      jasmine.any(Number)
    );
  });

  it('should handle copy error', () => {
    const item = { id: '1', type: 'icon', name: 'Icon 1', svg: '<svg>test</svg>', createdAt: Date.now() };
    
    spyOn(navigator.clipboard, 'writeText').and.throwError('Copy error');
    component.copySvg(item);
    
    expect(toastServiceSpy.showToast).toHaveBeenCalledWith(
      jasmine.stringContaining('Failed'),
      jasmine.any(String),
      jasmine.any(Number)
    );
  });

  it('should export history as JSON', () => {
    component.historyItems = [
      { id: '1', type: 'icon', name: 'Icon 1', svg: '<svg>1</svg>', createdAt: Date.now() }
    ];
    
    spyOn(component, 'downloadJson');
    component.exportHistory();
    
    expect(component.downloadJson).toHaveBeenCalled();
  });

  it('should get history item type icon', () => {
    const item = { type: 'icon' } as any;
    expect(component.getItemIcon(item)).toContain('icon');
  });

  it('should get history item type favicon', () => {
    const item = { type: 'favicon' } as any;
    expect(component.getItemIcon(item)).toContain('favicon');
  });

  it('should get history item type banner', () => {
    const item = { type: 'banner' } as any;
    expect(component.getItemIcon(item)).toContain('banner');
  });

  it('should get history item type html', () => {
    const item = { type: 'html' } as any;
    expect(component.getItemIcon(item)).toContain('html');
  });

  it('should format date correctly', () => {
    const date = new Date('2024-01-15T12:30:45');
    const formatted = component.formatDate(date.getTime());
    expect(formatted).toContain('2024');
    expect(formatted).toContain('01');
    expect(formatted).toContain('15');
  });

  it('should save history to localStorage', () => {
    spyOn(localStorage, 'setItem');
    component.historyItems = [
      { id: '1', type: 'icon', name: 'Test', svg: '<svg>test</svg>', createdAt: Date.now() }
    ];
    
    component.saveHistory();
    
    expect(localStorage.setItem).toHaveBeenCalledWith('history', JSON.stringify(component.historyItems));
  });

  it('should add new item to history', () => {
    spyOn(localStorage, 'setItem');
    const newItem = { id: '1', type: 'icon', name: 'New Icon', svg: '<svg>new</svg>', createdAt: Date.now() };
    
    component.addToHistory(newItem);
    
    expect(component.historyItems.length).toBe(1);
    expect(component.historyItems[0]).toEqual(newItem);
    expect(localStorage.setItem).toHaveBeenCalled();
  });
});
