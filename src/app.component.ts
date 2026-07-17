import { Component, signal, WritableSignal, computed, Signal, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeUrl, SafeHtml } from '@angular/platform-browser';
import { ICON_PRESETS, IconPreset, IconCategory } from './icon-presets';
import { IconForm } from './icon-form';

interface IconSizeOption {
  value: string;
  label: string;
}

interface Translations {
  [key: string]: any;
}

interface HistoryItem {
  id: number;
  type: 'png' | 'svg';
  description: string;
  data: string; // base64 for png, raw code for svg
  timestamp: number;
}

// Reduced from 20 to 8 to prevent localStorage quota errors.
const MAX_HISTORY_ITEMS = 8;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, IconForm],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  apiProvider: WritableSignal<'mistral'> = signal('mistral');
  hasGeminiKey: WritableSignal<boolean> = signal(false);
  hasMistralKey: WritableSignal<boolean> = signal(false);

  productDescription: WritableSignal<string> = signal('');
  productUrl: WritableSignal<string> = signal('');
  selectedSize: WritableSignal<string> = signal('512');
  selectedAspectRatio: WritableSignal<string> = signal('1:1');
  generatedImageUrl: WritableSignal<string | null> = signal(null);

  getPngDimensions(maxSize: number, aspectRatio: string): { width: number; height: number } {
    if (aspectRatio === '16:9') {
      return { width: maxSize, height: Math.round((maxSize * 9) / 16) };
    } else if (aspectRatio === '4:3') {
      return { width: maxSize, height: Math.round((maxSize * 3) / 4) };
    } else if (aspectRatio === '9:16') {
      return { width: Math.round((maxSize * 9) / 16), height: maxSize };
    }
    return { width: maxSize, height: maxSize };
  }
  loading: WritableSignal<boolean> = signal(false);
  error: WritableSignal<string | null> = signal(null);

  // SVG-related state
  generatedSvgCode: WritableSignal<string | null> = signal(null);
  generatedSvgUrl: Signal<SafeUrl | null>;
  loadingSvg: WritableSignal<boolean> = signal(false);
  errorSvg: WritableSignal<string | null> = signal(null);

  // Preset enhancement state
  enhancingPreset: WritableSignal<string | null> = signal(null);
  errorEnhancing: WritableSignal<string | null> = signal(null);

  // History state
  generationHistory: WritableSignal<HistoryItem[]> = signal([]);

  // Gallery, Search, Filters, Lightbox and Toast state
  searchTerm: WritableSignal<string> = signal('');
  activeFilter: WritableSignal<'all' | 'png' | 'svg'> = signal('all');
  selectedHistoryItem: WritableSignal<HistoryItem | null> = signal(null);
  lightboxBg: WritableSignal<'light' | 'dark' | 'grid'> = signal('grid');
  toastMessage: WritableSignal<string | null> = signal(null);
  private toastTimeout: any = null;

  filteredHistory = computed(() => {
    const history = this.generationHistory();
    const filter = this.activeFilter();
    const query = this.searchTerm().toLowerCase().trim();

    return history.filter(item => {
      const matchesType = filter === 'all' || item.type === filter;
      const matchesSearch = !query || item.description.toLowerCase().includes(query);
      return matchesType && matchesSearch;
    });
  });

  historyStats = computed(() => {
    const history = this.generationHistory();
    const total = history.length;
    const png = history.filter(item => item.type === 'png').length;
    const svg = history.filter(item => item.type === 'svg').length;
    return { total, png, svg };
  });

  // Language state
  language: WritableSignal<'en' | 'sk'> = signal('en');
  t: Signal<any>;

  // Loading progress state
  generationProgress: WritableSignal<number> = signal(0);
  generationStep: WritableSignal<number> = signal(0);

  private sanitizer = inject(DomSanitizer);

  iconPresets = ICON_PRESETS;

  private translations: Translations = {
    en: {
      title: 'PWA Icon Generator',
      presetsTitle: 'Or choose a preset for inspiration',
      productDescriptionLabel: 'Product Description',
      productDescriptionPlaceholder: 'e.g., A mobile app for tracking fitness goals, with a sleek, minimalist design focusing on progress visualization.',
      productUrlLabel: 'Product URL (Optional)',
      productUrlPlaceholder: 'e.g., https://example.com/fitness-app',
      iconSizeLabel: 'Icon Size (for PNG)',
      generateButton: 'Generate PWA Icon (PNG)',
      generatingButton: 'Generating PNG...',
      generatedIconHeader: 'Generated PWA Icon (PNG)',
      downloadHelpText: 'Click download to get a PNG file resized to your selected dimensions, ready for your manifest.json.',
      downloadButton: 'Download Icon (PNG)',
      errorDescriptionEmpty: 'Product description cannot be empty.',
      aspectRatioLabel: 'Aspect Ratio',
      aspectRatio1_1: '1:1 Square (Optimal PWA)',
      aspectRatio16_9: '16:9 Landscape (Splash)',
      aspectRatio4_3: '4:3 Standard (Classic)',
      aspectRatio9_16: '9:16 Portrait (Mobile Launch)',
      errorInvalidUrl: 'Please enter a valid URL (e.g., https://example.com).',
      errorNoImage: 'No image was generated. Please try again with a different description.',
      errorApiKey: 'There is an issue with your API key. Please ensure it is valid and configured correctly.',
      errorNetwork: 'A network error occurred. Please check your internet connection and try again.',
      errorSafety: 'The request was blocked due to content safety policies. Please modify your description and try again.',
      errorQuota: 'You have exceeded your API quota. Please check your usage and limits.',
      errorUnknown: 'An unknown error occurred while generating the icon.',
      errorConfig: "API_KEY is not configured. Please ensure it's set in the environment.",
      errorFailed: (message: string) => `Failed to generate icon: ${message}`,
      generateSvgButton: 'Generate SVG Icon',
      generatingSvgButton: 'Generating SVG...',
      generatedSvgHeader: 'Generated SVG Icon',
      downloadSvgButton: 'Download Icon (SVG)',
      generatedSvgCodeHeader: 'SVG Code',
      errorSvgInvalid: 'The generated response was not valid SVG. Please try again.',
      historyTitle: 'Generation History',
      clearHistoryButton: 'Clear History',
      historyEmpty: 'Your generation history is empty.',
      downloadFromHistory: 'Download',
      errorEnhancingFailed: 'Failed to generate a new description from the preset.',
      gallerySearchPlaceholder: 'Search generated icons...',
      galleryFilterAll: 'All Formats',
      galleryFilterPng: 'PNG Format',
      galleryFilterSvg: 'SVG Format',
      galleryStatsTotal: 'Total Icons',
      galleryStatsPng: 'PNG Icons',
      galleryStatsSvg: 'SVG Icons',
      galleryCardPromptTitle: 'Prompt',
      galleryCardDate: 'Created',
      galleryCardActionDownload: 'Download',
      galleryCardActionDelete: 'Delete',
      galleryCardActionReuse: 'Use Prompt',
      galleryCardActionCopyCode: 'Copy SVG Code',
      galleryLightboxTitle: 'Icon Details',
      galleryLightboxCopyPrompt: 'Copy Prompt',
      galleryLightboxCopySvg: 'Copy SVG Code',
      galleryLightboxBackground: 'Preview Background',
      galleryLightboxBgLight: 'Light',
      galleryLightboxBgDark: 'Dark',
      galleryLightboxBgGrid: 'Grid',
      galleryLightboxOriginalRes: 'Original Resolution',
      galleryNoSearchResults: 'No icons found matching your search.',
      toastPromptCopied: 'Prompt copied to clipboard!',
      toastSvgCopied: 'SVG code copied to clipboard!',
      toastPromptReused: 'Prompt loaded into the generator!',
      toastItemDeleted: 'Icon deleted from history.',
      loadingProgressTitle: 'AI Icon Generation in Progress',
      loadingProgressStep1: 'Analyzing description and target domain...',
      loadingProgressStep2: 'Formulating design concept and layers...',
      loadingProgressStep3: 'Rendering asset details using AI model...',
      loadingProgressStep4: 'Finalizing icon format and processing layout...',
      promptEnhancer: (
        allPresets: IconCategory[],
        currentDescription: string,
        currentUrl: string,
        iconSize: string,
        categoryId: string,
        iconId: string
      ) => `
Below is the JSON configuration of iconCategories with icon presets.
${JSON.stringify(allPresets, null, 2)}

Use the following inputs:
Product Description: "${currentDescription}"
Product URL: "${currentUrl}"
Icon Size: "${iconSize}x${iconSize}"
Selected Category ID: "${categoryId}"
Selected Icon ID: "${iconId}"

TASK:
In the iconCategories JSON, find the object with id == "${categoryId}".
In its icons array, find the icon with id == "${iconId}".
Based on its "description" and "styleHint", and the user's "Product Description" and "Product URL", create a new, detailed, and creative visual description for a PWA icon. This new description should merge the core idea from the user with the style and concept of the selected preset.

RULES:
- The output should be a single paragraph of text.
- Do NOT output JSON or any other format.
- The output should be a description suitable to be used in another prompt to generate an image.
- It should be concise but precise. Do not write an essay.
- The description should be imaginative and inspiring for an AI image generator.
- Focus on visual elements, style, color, and composition.
- The resulting description MUST be in English.
`,
      pngPrompt: (description: string, url: string, aspectRatio: string) => {
        let ratioDesc = 'high-resolution square image';
        if (aspectRatio === '16:9') {
          ratioDesc = '16:9 landscape aspect ratio image';
        } else if (aspectRatio === '4:3') {
          ratioDesc = '4:3 standard aspect ratio image';
        } else if (aspectRatio === '9:16') {
          ratioDesc = '9:16 portrait aspect ratio image';
        }
        return `
Generate an ultra-modern, detailed, 4D parallax PWA icon with the following properties:

1. STYLE
- Futuristic 4D parallax with distinct, floating layers.
- A subtle neon glow using a palette of blue, purple, and turquoise.
- A high-tech aesthetic combining Apple Vision Pro, Cyberpunk, and minimalist luxury design.
- A strong emphasis on deep 3D layers that could be animated with a parallax effect.
- Perfectly clean edges, no visual noise, professional UI/UX quality.
- Light liquid-glass elements in the foreground.

2. ICON CONTENT
Based on this information:
- Product Description: "${description}"
- Product URL: "${url}"
Create iconography that:
- Faithfully represents the product.
- Is original and creative.
- Is instantly recognizable even at small sizes.
- Features at least 5 distinct parallax layers: background glow, mid-depth gradient, a central floating object, a highlight layer, and a foreground glossy layer.

3. TECHNICAL PARAMETERS & OUTPUT
- Generate a ${ratioDesc}.
- The output must be a PNG file.
- Apply high sharpness (around 35-50) for crisp details.
- Use RGB color mode.
- The design must be optimized for PWA icons, avoiding overly complex details that are unreadable when small.
- The final output must be ONLY the icon. No text, no extra background, no mockups. Just the clean icon shape with its 4D layers and neon edges.
`;
      },
      svgPrompt: (description: string, url: string, aspectRatio: string) => {
        let viewBox = 'viewBox="0 0 100 100"';
        let ratioDesc = 'square aspect ratio';
        if (aspectRatio === '16:9') {
          viewBox = 'viewBox="0 0 160 90"';
          ratioDesc = '16:9 landscape aspect ratio';
        } else if (aspectRatio === '4:3') {
          viewBox = 'viewBox="0 0 400 300"';
          ratioDesc = '4:3 standard aspect ratio';
        } else if (aspectRatio === '9:16') {
          viewBox = 'viewBox="0 0 90 160"';
          ratioDesc = '9:16 portrait aspect ratio';
        }
        return `
You are an expert SVG icon designer. Generate an ultra-modern, detailed, 4D parallax PWA icon as an SVG, with the following properties:

1. STYLE
- Futuristic 4D parallax with clearly distinct, floating layers.
- Use a subtle neon glow effect, achievable with SVG filters or gradients, in a palette of blue, purple, and turquoise.
- The design should be high-tech, inspired by Apple Vision Pro and Cyberpunk, but with minimalist luxury.
- Emphasize deep 3D-like layers, structured for parallax animation.
- Ensure perfectly clean vector paths and edges.
- Incorporate light liquid-glass elements in the foreground using gradients or semi-transparent shapes.

2. ICON CONTENT
Based on this information:
- Product Description: "${description}"
- Product URL: "${url}"
Create iconography that:
- Faithfully represents the product.
- Is original and creative.
- Is instantly recognizable even at small sizes.

3. TECHNICAL PARAMETERS & SVG STRUCTURE
- The SVG must have a ${ratioDesc} with ${viewBox}.
- The output must be ONLY the raw <svg> element. DO NOT include any XML prolog (<?xml...?>), comments, or any text outside the <svg> tags.
- The SVG must be structured with named groups for each parallax layer, ready for CSS animation. Use the following structure EXACTLY:
<svg ${viewBox} xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Gradients or filters can go here -->
  </defs>
  <g id="layer-background">
    <!-- Background glow elements -->
  </g>
  <g id="layer-mid">
    <!-- Mid-depth gradient elements -->
  </g>
  <g id="layer-core">
    <!-- The main floating object/symbol -->
  </g>
  <g id="layer-highlight">
    <!-- Highlight shapes and effects -->
  </g>
  <g id="layer-glass">
    <!-- Foreground glossy/liquid-glass elements -->
  </g>
</svg>

4. OUTPUT
- Generate only the SVG code. No text, no explanation, no mockups. Just the clean icon shape with its 4D layers and neon edges.
- The final design must be optimized for PWA icons, avoiding overly complex details that would be unreadable when small.
`;
      },
    },
    sk: {
      title: 'Generátor PWA Ikon',
      presetsTitle: 'Alebo si vyberte inšpiráciu',
      productDescriptionLabel: 'Popis Produktu',
      productDescriptionPlaceholder: 'napr., Mobilná aplikácia na sledovanie fitness cieľov, s elegantným, minimalistickým dizajnom zameraným na vizualizáciu pokroku.',
      productUrlLabel: 'URL Produktu (Voliteľné)',
      productUrlPlaceholder: 'napr., https://example.com/fitness-app',
      iconSizeLabel: 'Veľkosť Ikony (pre PNG)',
      generateButton: 'Generovať PWA Ikonu (PNG)',
      generatingButton: 'Generuje sa PNG...',
      generatedIconHeader: 'Vygenerovaná PWA Ikona (PNG)',
      downloadHelpText: 'Kliknite na stiahnuť pre získanie PNG súboru s upravenou veľkosťou podľa vášho výberu, pripraveného pre váš manifest.json.',
      downloadButton: 'Stiahnuť Ikonu (PNG)',
      errorDescriptionEmpty: 'Popis produktu nemôže byť prázdny.',
      aspectRatioLabel: 'Pomer Strán',
      aspectRatio1_1: '1:1 Štvorec (Optimálne PWA)',
      aspectRatio16_9: '16:9 Na šírku (Úvodná obrazovka)',
      aspectRatio4_3: '4:3 Štandard (Klasický)',
      aspectRatio9_16: '9:16 Na výšku (Mobilný štart)',
      errorInvalidUrl: 'Zadajte prosím platnú URL adresu (napr. https://example.com).',
      errorNoImage: 'Nebol vygenerovaný žiadny obrázok. Skúste to prosím znova s iným popisom.',
      errorApiKey: 'Vyskytol sa problém s vaším API kľúčom. Uistite sa, že je platný a správne nakonfigurovaný.',
      errorNetwork: 'Vyskytla sa chyba siete. Skontrolujte prosím vaše internetové pripojenie a skúste to znova.',
      errorSafety: 'Požiadavka bola zablokovaná z dôvodu bezpečnostných politík obsahu. Upravte prosím svoj popis a skúste to znova.',
      errorQuota: 'Prekročili ste svoju API kvótu. Skontrolujte prosím svoje využitie a limity.',
      errorUnknown: 'Pri generovaní ikony sa vyskytla neznáma chyba.',
      errorConfig: 'API_KEY nie je nakonfigurovaný. Uistite sa, že je nastavený v prostredí.',
      errorFailed: (message: string) => `Nepodarilo sa vygenerovať ikonu: ${message}`,
      generateSvgButton: 'Generovať SVG Ikonu',
      generatingSvgButton: 'Generuje sa SVG...',
      generatedSvgHeader: 'Vygenerovaná SVG Ikona',
      downloadSvgButton: 'Stiahnuť Ikonu (SVG)',
      generatedSvgCodeHeader: 'SVG Kód',
      errorSvgInvalid: 'Vygenerovaná odpoveď nebola platné SVG. Skúste to prosím znova.',
      historyTitle: 'História Generovania',
      clearHistoryButton: 'Vymazať Históriu',
      historyEmpty: 'Vaša história generovania je prázdna.',
      downloadFromHistory: 'Stiahnuť',
      errorEnhancingFailed: 'Nepodarilo sa vygenerovať nový popis z predvoľby.',
      gallerySearchPlaceholder: 'Hľadať vygenerované ikony...',
      galleryFilterAll: 'Všetky formáty',
      galleryFilterPng: 'PNG formát',
      galleryFilterSvg: 'SVG formát',
      galleryStatsTotal: 'Celkom ikon',
      galleryStatsPng: 'PNG ikony',
      galleryStatsSvg: 'SVG ikony',
      galleryCardPromptTitle: 'Popis',
      galleryCardDate: 'Vytvorené',
      galleryCardActionDownload: 'Stiahnuť',
      galleryCardActionDelete: 'Vymazať',
      galleryCardActionReuse: 'Použiť popis',
      galleryCardActionCopyCode: 'Kopírovať SVG',
      galleryLightboxTitle: 'Detail ikony',
      galleryLightboxCopyPrompt: 'Kopírovať popis',
      galleryLightboxCopySvg: 'Kopírovať SVG kód',
      galleryLightboxBackground: 'Pozadie náhľadu',
      galleryLightboxBgLight: 'Svetlé',
      galleryLightboxBgDark: 'Tmavé',
      galleryLightboxBgGrid: 'Mriežka',
      galleryLightboxOriginalRes: 'Pôvodné rozlíšenie',
      galleryNoSearchResults: 'Nenašli sa žiadne ikony zodpovedajúce vyhľadávaniu.',
      toastPromptCopied: 'Popis bol skopírovaný do schránky!',
      toastSvgCopied: 'SVG kód bol skopírovaný do schránky!',
      toastPromptReused: 'Popis bol načítaný do generátora!',
      toastItemDeleted: 'Ikona bola vymazaná z histórie.',
      loadingProgressTitle: 'Generovanie ikony cez AI prebieha',
      loadingProgressStep1: 'Analyzuje sa popis a cieľová doména...',
      loadingProgressStep2: 'Navrhujú sa dizajnové koncepty a vrstvy...',
      loadingProgressStep3: 'Generujú sa detaily pomocou AI modelu...',
      loadingProgressStep4: 'Dokončuje sa formát ikony a spracováva sa rozloženie...',
      promptEnhancer: (
        allPresets: IconCategory[],
        currentDescription: string,
        currentUrl: string,
        iconSize: string,
        categoryId: string,
        iconId: string
      ) => `
Nižšie je JSON konfigurácia iconCategories s ikonovými presetmi.
${JSON.stringify(allPresets, null, 2)}

Použi nasledujúce vstupy:
Product Description: "${currentDescription}"
URL Produktu: "${currentUrl}"
Veľkosť Ikony: "${iconSize}x${iconSize}"
Selected Category ID: "${categoryId}"
Selected Icon ID: "${iconId}"

ÚLOHA:
V JSONe iconCategories nájdi objekt s id == "${categoryId}".
V jeho poli icons nájdi ikonku, ktorá má id == "${iconId}".
Na základe jej "description" a "styleHint", a používateľovho "Product Description" a "Product URL", vytvor nový, detailný a kreatívny vizuálny popis pre PWA ikonu. Tento nový popis by mal spojiť hlavnú myšlienku od používateľa so štýlom a konceptom vybranej predvoľby.

PRAVIDLÁ:
- Výstupom by mal byť jeden odsek textu.
- NEVYPISUJ JSON ani žiadny iný formát.
- Výstupom by mal byť popis vhodný na použitie v ďalšom prompte na generovanie obrázku.
- Mal by byť stručný, ale presný. Nepíš esej.
- Popis by mal byť nápaditý a inšpiratívny pre AI generátor obrázkov.
- Zameraj sa na vizuálne prvky, štýl, farbu a kompozíciu.
- Výsledný popis MUSÍ byť v slovenčine.
`,
      pngPrompt: (description: string, url: string, aspectRatio: string) => {
        let ratioDesc = 'obrázok vo vysokom rozlíšení a štvorcovom formáte';
        if (aspectRatio === '16:9') {
          ratioDesc = 'obrázok s pomerom strán 16:9 na šírku';
        } else if (aspectRatio === '4:3') {
          ratioDesc = 'obrázok s pomerom strán 4:3';
        } else if (aspectRatio === '9:16') {
          ratioDesc = 'obrázok s pomerom strán 9:16 na výšku';
        }
        return `
Vytvor ultra-modernú, detailnú, 4D parallax PWA ikonu s nasledujúcimi vlastnosťami:

1. ŠTÝL
- futuristický 4D parallax (vrstvy musia byť zreteľné, “floating layers”)
- jemný neon glow (modrý, fialový, tyrkysový)
- high-tech, Apple Vision Pro + Cyberpunk + minimalistický luxury dizajn
- tvrdý dôraz na hlboké 3D vrstvy, ktoré sa dajú animovať paralaxom
- čisté hrany, žiadny vizuálny šum, profesionálny UI/UX štýl
- light liquid-glass prvky v popredí

2. OBSAH IKONY
Použi informácie:
- Popis Produktu: "${description}"
- URL Produktu: "${url}"
Na základe týchto údajov vymysli ikonografiu, ktorá:
- zodpovedá produktu
- je originálna
- je jednoznačne rozpoznateľná aj v malom rozlíšení
- má minimálne 5 paralaxových vrstiev: background glow, mid-depth gradient, floating object, highlight layer, foreground glossy layer

3. TECHNICKÉ PARAMETRE & VÝSTUP
- Vygeneruj ${ratioDesc}.
- Výstup musí byť PNG súbor.
- Aplikuj vysokú ostrosť (približne 35-50) pre ostré detaily.
- Použi farebný mód RGB.
- Dizajn musí byť optimalizovaný pre PWA ikony, vyhýbaj sa príliš zložitým detailom, ktoré sú nečitateľné v malom.
- Konečný výstup musí byť IBA ikona. Žiadny text, žiadne extra pozadie, žiadne mockupy. Iba čistý tvar ikony s jej 4D vrstvami a neónovými hranami.
`;
      },
      svgPrompt: (description: string, url: string, aspectRatio: string) => {
        let viewBox = 'viewBox="0 0 100 100"';
        let ratioDesc = 'štvorcové s viewBox="0 0 100 100"';
        if (aspectRatio === '16:9') {
          viewBox = 'viewBox="0 0 160 90"';
          ratioDesc = 's pomerom strán 16:9 a s viewBox="0 0 160 90"';
        } else if (aspectRatio === '4:3') {
          viewBox = 'viewBox="0 0 400 300"';
          ratioDesc = 's pomerom strán 4:3 a s viewBox="0 0 400 300"';
        } else if (aspectRatio === '9:16') {
          viewBox = 'viewBox="0 0 90 160"';
          ratioDesc = 's pomerom strán 9:16 a s viewBox="0 0 90 160"';
        }
        return `
Ste expert na dizajn SVG ikon. Vytvorte ultra-modernú, detailnú, 4D parallax PWA ikonu ako SVG s nasledujúcimi vlastnosťami:

1. ŠTÝL
- futuristický 4D parallax s jasne odlíšenými, plávajúcimi vrstvami.
- použite jemný neónový efekt, dosiahnuteľný pomocou SVG filtrov alebo gradientov, v palete modrej, fialovej a tyrkysovej.
- dizajn by mal byť high-tech, inšpirovaný Apple Vision Pro a Cyberpunkom, ale s minimalistickým luxusom.
- zdôraznite hlboké 3D-podobné vrstvy, štruktúrované pre parallax animáciu.
- zabezpečte dokonale čisté vektorové cesty a hrany.
- zakomponujte svetlé prvky z tekutého skla v popredí pomocou gradientov alebo polopriehľadných tvarov.

2. OBSAH IKONY
Na základe týchto informácií:
- Popis Produktu: "${description}"
- URL Produktu: "${url}"
Vytvorte ikonografiu, ktorá:
- verne reprezentuje produkt.
- je originálna a kreatívna.
- je okamžite rozpoznateľná aj v malých veľkostiach.

3. TECHNICKÉ PARAMETRE & ŠTRUKTÚRA SVG
- SVG musí byť ${ratioDesc}.
- výstup musí byť IBA surový <svg> element. NEZAHRŇUJTE žiadny XML prológ (<?xml...?>), komentáre, ani žiadny text mimo <svg> tagov.
- SVG musí byť štruktúrované s pomenovanými skupinami pre každú parallax vrstvu, pripravené na CSS animáciu. Použite PRESNE nasledujúcu štruktúru:
<svg ${viewBox} xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Tu môžu byť gradienty alebo filtre -->
  </defs>
  <g id="layer-background">
    <!-- Prvky pre žiaru pozadia -->
  </g>
  <g id="layer-mid">
    <!-- Prvky gradientu v strednej hĺbke -->
  </g>
  <g id="layer-core">
    <!-- Hlavný plávajúci objekt/symbol -->
  </g>
  <g id="layer-highlight">
    <!-- Zvýrazňujúce tvary a efekty -->
  </g>
  <g id="layer-glass">
    <!-- Prvky lesklého/tekutého skla v popredí -->
  </g>
</svg>

4. VÝSTUP
- Generujte iba SVG kód. Žiadny text, žiadne vysvetlenie, žiadne mockupy. Iba čistý tvar ikony s jej 4D vrstvami a neónovými hranami.
- Finálny dizajn musí byť optimalizovaný pre PWA ikony, vyhýbajúc sa príliš zložitým detailom, ktoré by boli nečitateľné v malom.
`;
      },
    }
  };

  iconSizes: IconSizeOption[] = [
    { value: '192', label: '192x192 px' },
    { value: '256', label: '256x256 px' },
    { value: '384', label: '384x384 px' },
    { value: '512', label: '512x512 px' },
  ];

  private readonly historyStorageKey = 'pwa-icon-generator-history';

  constructor() {
    this.t = computed(() => this.translations[this.language()]);
    this.loadHistory();

    this.generatedSvgUrl = computed(() => {
      const svgCode = this.generatedSvgCode();
      if (svgCode) {
        return this.getSafeSvgUrl(svgCode);
      }
      return null;
    });
  }

  private progressInterval: any = null;

  startProgressTracker(): void {
    this.generationProgress.set(0);
    this.generationStep.set(1);
    
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
    
    this.progressInterval = setInterval(() => {
      const current = this.generationProgress();
      if (current < 95) {
        const increment = current < 30 ? 5 : (current < 70 ? 3 : 1);
        const nextProgress = Math.min(95, current + increment);
        this.generationProgress.set(nextProgress);
        
        if (nextProgress >= 75) {
          this.generationStep.set(4);
        } else if (nextProgress >= 45) {
          this.generationStep.set(3);
        } else if (nextProgress >= 20) {
          this.generationStep.set(2);
        }
      }
    }, 300);
  }

  completeProgressTracker(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
    this.generationProgress.set(100);
    this.generationStep.set(4);
    
    setTimeout(() => {
      if (!this.loading() && !this.loadingSvg()) {
        this.generationProgress.set(0);
        this.generationStep.set(0);
      }
    }, 1000);
  }

  async ngOnInit(): Promise<void> {
    if (typeof window !== 'undefined') {
      await this.checkConfig();
    }
  }

  async checkConfig(): Promise<void> {
    try {
      const response = await fetch('/api/config');
      if (response.ok) {
        const data = await response.json();
        this.hasGeminiKey.set(false);
        this.hasMistralKey.set(data.hasMistral);
        this.apiProvider.set('mistral');
      }
    } catch (e) {
      console.error('Failed to fetch API config:', e);
    }
  }

  cleanSvgCode(svgCode: string): string {
    let cleaned = svgCode.trim();
    if (cleaned.includes('```xml')) {
      cleaned = cleaned.substring(cleaned.indexOf('```xml') + 6);
      cleaned = cleaned.substring(0, cleaned.lastIndexOf('```')).trim();
    } else if (cleaned.includes('```html')) {
      cleaned = cleaned.substring(cleaned.indexOf('```html') + 7);
      cleaned = cleaned.substring(0, cleaned.lastIndexOf('```')).trim();
    } else if (cleaned.includes('```svg')) {
      cleaned = cleaned.substring(cleaned.indexOf('```svg') + 6);
      cleaned = cleaned.substring(0, cleaned.lastIndexOf('```')).trim();
    } else if (cleaned.includes('```')) {
      cleaned = cleaned.substring(cleaned.indexOf('```') + 3);
      cleaned = cleaned.substring(0, cleaned.lastIndexOf('```')).trim();
    }
    return cleaned;
  }

  async convertSvgToPng(svgCode: string, width: number, height: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const svgBlob = new Blob([svgCode], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get 2D canvas context'));
          return;
        }
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        const pngDataUrl = canvas.toDataURL('image/png');
        URL.revokeObjectURL(url);
        
        const base64 = pngDataUrl.split(',')[1];
        resolve(base64);
      };

      img.onerror = (err) => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to render SVG to canvas'));
      };

      img.src = url;
    });
  }

  getSafeSvgUrl(svgCode: string): SafeUrl {
    const svgBlob = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgCode)}`;
    return this.sanitizer.bypassSecurityTrustUrl(svgBlob);
  }

  getSafeSvgHtml(svgCode: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svgCode);
  }

  setLanguage(lang: 'en' | 'sk'): void {
    this.language.set(lang);
  }
  
  async selectPreset(preset: IconPreset, category: IconCategory): Promise<void> {
    this.enhancingPreset.set(preset.id);
    this.errorEnhancing.set(null);
    this.error.set(null);
    this.errorSvg.set(null);

    try {
      const prompt = this.t().promptEnhancer(
        this.iconPresets,
        this.productDescription(),
        this.productUrl(),
        this.selectedSize(),
        category.id,
        preset.id
      );

      const response = await fetch('/api/enhance-preset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        const errMsg = await this.getErrorMessage(response);
        throw new Error(errMsg);
      }

      const data = await response.json();
      const newDescription = data.enhancedDescription.trim();
      this.productDescription.set(newDescription);

    } catch (e: any) {
      console.error('Error enhancing description:', e);
      this.errorEnhancing.set(this.t().errorEnhancingFailed);
    } finally {
      this.enhancingPreset.set(null);
    }
  }

  onFormSubmit(event: { values: any; type: 'png' | 'svg' }): void {
    this.productDescription.set(event.values.description);
    this.productUrl.set(event.values.url);
    this.selectedSize.set(event.values.size);
    this.selectedAspectRatio.set(event.values.aspectRatio);

    if (event.type === 'png') {
      this.generateIcon();
    } else {
      this.generateSvgIcon();
    }
  }

  onFormValuesChanged(values: any): void {
    this.productDescription.set(values.description);
    this.productUrl.set(values.url);
    this.selectedSize.set(values.size);
    this.selectedAspectRatio.set(values.aspectRatio);
  }

  async generateIcon(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    this.generatedImageUrl.set(null);
    this.startProgressTracker();

    const description = this.productDescription();
    const url = this.productUrl();
    const aspectRatio = this.selectedAspectRatio();

    if (!description) {
      this.error.set(this.t().errorDescriptionEmpty);
      this.loading.set(false);
      this.completeProgressTracker();
      return;
    }

    const prompt = this.t().svgPrompt(description, url, aspectRatio);
    try {
      const response = await fetch('/api/generate-svg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        const errMsg = await this.getErrorMessage(response);
        throw new Error(errMsg);
      }

      const data = await response.json();
      let svgCode = data.svgCode.trim();

      svgCode = this.cleanSvgCode(svgCode);

      if (svgCode.includes('<svg') && svgCode.includes('</svg>')) {
        const startIndex = svgCode.indexOf('<svg');
        const endIndex = svgCode.lastIndexOf('</svg>') + 6;
        svgCode = svgCode.substring(startIndex, endIndex);

        const size = parseInt(this.selectedSize(), 10) || 512;
        const dims = this.getPngDimensions(size, aspectRatio);
        const pngBase64 = await this.convertSvgToPng(svgCode, dims.width, dims.height);
        const imageUrl = `data:image/png;base64,${pngBase64}`;

        this.generatedImageUrl.set(imageUrl);
        this.addToHistory({
          id: Date.now(),
          type: 'png',
          description: description,
          data: imageUrl,
          timestamp: Date.now(),
        });
      } else {
        this.error.set(this.t().errorSvgInvalid);
      }
    } catch (e: any) {
      this.handleError(e, this.error);
    } finally {
      this.loading.set(false);
      this.completeProgressTracker();
    }
  }

  async generateSvgIcon(): Promise<void> {
    this.loadingSvg.set(true);
    this.errorSvg.set(null);
    this.generatedSvgCode.set(null);
    this.startProgressTracker();

    const description = this.productDescription();
    const url = this.productUrl();
    const aspectRatio = this.selectedAspectRatio();

    if (!description) {
      this.errorSvg.set(this.t().errorDescriptionEmpty);
      this.loadingSvg.set(false);
      this.completeProgressTracker();
      return;
    }

    const prompt = this.t().svgPrompt(description, url, aspectRatio);

    try {
      const response = await fetch('/api/generate-svg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        const errMsg = await this.getErrorMessage(response);
        throw new Error(errMsg);
      }

      const data = await response.json();
      let svgCode = data.svgCode.trim();

      svgCode = this.cleanSvgCode(svgCode);
      
      if (svgCode.includes('<svg') && svgCode.includes('</svg>')) {
        const startIndex = svgCode.indexOf('<svg');
        const endIndex = svgCode.lastIndexOf('</svg>') + 6;
        svgCode = svgCode.substring(startIndex, endIndex);

        this.generatedSvgCode.set(svgCode);
        this.addToHistory({
          id: Date.now(),
          type: 'svg',
          description: description,
          data: svgCode,
          timestamp: Date.now(),
        });
      } else {
        console.error('Generated text is not valid SVG:', svgCode);
        this.errorSvg.set(this.t().errorSvgInvalid);
      }

    } catch (e: any) {
      this.handleError(e, this.errorSvg);
    } finally {
      this.loadingSvg.set(false);
      this.completeProgressTracker();
    }
  }

  private async getErrorMessage(response: Response): Promise<string> {
    if (response.status === 512) {
      return 'CONFIG_ERROR';
    }
    try {
      const data = await response.json();
      return data.error || 'Server error';
    } catch {
      try {
        const text = await response.text();
        if (text && text.trim().startsWith('<!DOCTYPE') === false && text.length < 200) {
          return text.trim();
        }
      } catch {}
    }
    return `Server error (${response.status})`;
  }

  private handleError(e: any, errorSignal: WritableSignal<string | null>): void {
    console.error('Error during generation:', e);
    let errorMessage = this.t().errorUnknown;
    if (e && e.message) {
      const message = e.message.toLowerCase();
      if (message.includes('config_error') || message.includes('api_key is not configured') || message.includes('api_key is not set')) {
        errorMessage = this.t().errorConfig;
      } else if (message.includes('api key')) {
        errorMessage = this.t().errorApiKey;
      } else if (message.includes('fetch')) {
        errorMessage = this.t().errorNetwork;
      } else if (message.includes('safety') || message.includes('policy') || message.includes('blocked')) {
        errorMessage = this.t().errorSafety;
      } else if (message.includes('quota')) {
        errorMessage = this.t().errorQuota;
      } else {
        errorMessage = this.t().errorFailed(e.message);
      }
    }
    errorSignal.set(errorMessage);
  }

  downloadImage(): void {
    const url = this.generatedImageUrl();
    if (url) {
      const size = parseInt(this.selectedSize(), 10) || 512;
      const dims = this.getPngDimensions(size, this.selectedAspectRatio());
      this.downloadPngFromBase64(url, dims.width, dims.height, `pwa-icon-${dims.width}x${dims.height}.png`);
    }
  }
  
  downloadSvgIcon(): void {
    const svgCode = this.generatedSvgCode();
    if (svgCode) {
      this.downloadSvgFromString(svgCode, 'pwa-icon.svg');
    }
  }
  
  // History Methods
  private loadHistory(): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }
    try {
      const storedHistory = localStorage.getItem(this.historyStorageKey);
      if (storedHistory) {
        let history: HistoryItem[] = JSON.parse(storedHistory);
        // Proactively trim history if it exceeds the current max size.
        if (history.length > MAX_HISTORY_ITEMS) {
          history = history.slice(0, MAX_HISTORY_ITEMS);
        }
        this.generationHistory.set(history);
      }
    } catch (e) {
      console.error('Failed to load history from localStorage', e);
      // If there's an error (e.g., corrupted data), clear history and storage.
      this.generationHistory.set([]);
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(this.historyStorageKey);
      }
    }
  }

  private saveHistory(): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }
    try {
      localStorage.setItem(this.historyStorageKey, JSON.stringify(this.generationHistory()));
    } catch (e) {
      console.error('Failed to save history to localStorage', e);
    }
  }

  private addToHistory(item: HistoryItem): void {
    this.generationHistory.update(history => {
      const newHistory = [item, ...history];
      return newHistory.slice(0, MAX_HISTORY_ITEMS);
    });
    this.saveHistory();
  }

  clearHistory(): void {
    this.generationHistory.set([]);
    this.selectedHistoryItem.set(null);
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.historyStorageKey);
    }
  }

  showToast(message: string): void {
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    this.toastMessage.set(message);
    this.toastTimeout = setTimeout(() => {
      this.toastMessage.set(null);
    }, 3000);
  }

  deleteHistoryItem(id: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    // Close lightbox if the deleted item was selected
    const selected = this.selectedHistoryItem();
    if (selected && selected.id === id) {
      this.selectedHistoryItem.set(null);
    }

    this.generationHistory.update(history => history.filter(item => item.id !== id));
    this.saveHistory();
    this.showToast(this.t().toastItemDeleted);
  }

  copyToClipboard(text: string, successMsg: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        this.showToast(successMsg);
      }).catch(err => {
        console.error('Failed to copy text: ', err);
      });
    }
  }

  reusePrompt(prompt: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.productDescription.set(prompt);
    this.showToast(this.t().toastPromptReused);
    
    // Close lightbox if open
    this.selectedHistoryItem.set(null);
    
    // Scroll smoothly to top generator card
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  openLightbox(item: HistoryItem): void {
    this.selectedHistoryItem.set(item);
  }

  closeLightbox(): void {
    this.selectedHistoryItem.set(null);
  }

  downloadHistoryItem(item: HistoryItem): void {
    if (item.type === 'png') {
      // Download PNG history items at a standard high-res size, calculating height dynamically
      this.downloadPngFromBase64(item.data, 512, undefined, `pwa-icon-history-512.png`);
    } else if (item.type === 'svg') {
      this.downloadSvgFromString(item.data, `pwa-icon-history.svg`);
    }
  }
  
  private downloadPngFromBase64(base64Url: string, width: number, height: number | undefined, filename: string): void {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height !== undefined ? height : Math.round((width * img.naturalHeight) / img.naturalWidth) || width;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const resizedUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = resizedUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    };
    img.src = base64Url;
  }
  
  private downloadSvgFromString(svgCode: string, filename: string): void {
    const blob = new Blob([svgCode], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}