import { Component, input, output, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { LogoComponent } from '../logo/logo.component';
import { MENU_ITEMS, ICONS, MenuCategory, MenuItem } from '../../models/menu.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, LogoComponent],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  // Inputs
  isOpen = input<boolean>(true);
  language = input<'en' | 'sk'>('en');
  
  // Outputs
  toggle = output<void>();
  
  // State
  menuItems = MENU_ITEMS;
  icons = ICONS;
  activeRoute = signal<string>('');
  expandedCategories = signal<Set<string>>(new Set(['main', 'generators']));
  
  // Injected services
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  
  constructor() {}
  
  ngOnInit(): void {
    // Set initial active route
    this.activeRoute.set(this.router.url.split('?')[0]);
    
    // Listen to route changes
    this.router.events.subscribe(() => {
      this.activeRoute.set(this.router.url.split('?')[0]);
    });
  }
  
  onToggle(): void {
    this.toggle.emit();
  }
  
  toggleCategory(categoryId: string): void {
    this.expandedCategories.update(categories => {
      const newCategories = new Set(categories);
      if (newCategories.has(categoryId)) {
        newCategories.delete(categoryId);
      } else {
        newCategories.add(categoryId);
      }
      return newCategories;
    });
  }
  
  isCategoryExpanded(categoryId: string): boolean {
    return this.expandedCategories().has(categoryId);
  }
  
  isItemActive(item: MenuItem): boolean {
    return this.activeRoute() === item.route || 
           this.activeRoute().startsWith(item.route + '/');
  }
  
  getIcon(iconKey: string): string {
    return this.icons[iconKey] || this.icons['dashboard'];
  }
  
  // Translation helper (will be connected to main translations later)
  translate(key: string): string {
    const translations: { [key: string]: { en: string; sk: string } } = {
      menuMain: { en: 'Main', sk: 'Hlavné' },
      menuDashboard: { en: 'Dashboard', sk: 'Nástroje' },
      menuGenerators: { en: 'Generators', sk: 'Generátory' },
      menuIconGenerator: { en: 'Icon Generator', sk: 'Generátor ikon' },
      menuFaviconGenerator: { en: 'Favicon Generator', sk: 'Generátor faviconov' },
      menuBannerGenerator: { en: 'Banner Generator', sk: 'Generátor bannerov' },
      menuPngToHtml: { en: 'PNG to HTML', sk: 'PNG na HTML' },
      menuHistory: { en: 'History', sk: 'História' },
      menuSettings: { en: 'Settings', sk: 'Nastavenia' }
    };
    
    const lang = this.language();
    return translations[key]?.[lang] || key;
  }
}
