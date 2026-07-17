import { Component, input, output, OnInit, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

export interface IconFormValues {
  description: string;
  url: string;
  size: string;
  aspectRatio: string;
}

@Component({
  selector: 'app-icon-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="form" class="space-y-6">
      <!-- Description Section -->
      <div class="space-y-2">
        <div class="flex justify-between items-center">
          <label for="formDescription" class="block text-lg font-semibold text-gray-200">
            {{ t().productDescriptionLabel }}
          </label>
          <span class="text-xs text-gray-400 font-mono">
            {{ form.get('description')?.value?.length || 0 }} chars
          </span>
        </div>
        <textarea
          id="formDescription"
          formControlName="description"
          rows="4"
          [placeholder]="t().productDescriptionPlaceholder"
          class="w-full p-3 bg-gray-700/80 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-100 placeholder-gray-400 resize-y transition-all duration-200"
          [class.border-red-500]="isFieldInvalid('description')"
          [class.border-gray-600]="!isFieldInvalid('description')"
        ></textarea>
        @if (isFieldInvalid('description')) {
          <p class="text-red-400 text-xs flex items-center gap-1 mt-1">
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{{ t().errorDescriptionEmpty }}</span>
          </p>
        }
      </div>

      <!-- URL Section -->
      <div class="space-y-2">
        <label for="formUrl" class="block text-lg font-semibold text-gray-200">
          {{ t().productUrlLabel }}
        </label>
        <input
          type="text"
          id="formUrl"
          formControlName="url"
          [placeholder]="t().productUrlPlaceholder"
          class="w-full p-3 bg-gray-700/80 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-100 placeholder-gray-400 transition-all duration-200"
          [class.border-red-500]="isFieldInvalid('url')"
          [class.border-gray-600]="!isFieldInvalid('url')"
        />
        @if (isFieldInvalid('url')) {
          <p class="text-red-400 text-xs flex items-center gap-1 mt-1">
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{{ t().errorInvalidUrl || 'Please enter a valid URL (e.g. https://example.com).' }}</span>
          </p>
        }
      </div>

      <!-- Grid for Size and Aspect Ratio -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Size dropdown -->
        <div class="space-y-2">
          <label for="formSize" class="block text-lg font-semibold text-gray-200">
            {{ t().iconSizeLabel }}
          </label>
          <select
            id="formSize"
            formControlName="size"
            class="w-full p-3 bg-gray-700/80 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-100 transition-all duration-200 cursor-pointer"
          >
            @for (size of iconSizes(); track size.value) {
              <option [value]="size.value" class="bg-gray-800">{{ size.label }}</option>
            }
          </select>
        </div>

        <!-- Aspect Ratio custom cards selection -->
        <div class="space-y-2">
          <span class="block text-lg font-semibold text-gray-200">
            {{ t().aspectRatioLabel || 'Aspect Ratio' }}
          </span>
          <div class="grid grid-cols-2 gap-3">
            @for (ratio of aspectRatios; track ratio.id) {
              <button
                type="button"
                (click)="selectRatio(ratio.id)"
                class="flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all duration-200 focus:outline-none"
                [class.bg-blue-600/10]="currentRatio === ratio.id"
                [class.border-blue-500]="currentRatio === ratio.id"
                [class.text-blue-400]="currentRatio === ratio.id"
                [class.bg-gray-800/40]="currentRatio !== ratio.id"
                [class.border-gray-700]="currentRatio !== ratio.id"
                [class.text-gray-400]="currentRatio !== ratio.id"
                [class.hover:border-gray-600]="currentRatio !== ratio.id"
                [class.hover:text-gray-200]="currentRatio !== ratio.id"
              >
                <!-- Ratio graphic placeholder -->
                <div class="flex items-center justify-center shrink-0 w-10 h-10 rounded bg-gray-900 border border-current transition-colors">
                  <div class="border border-current rounded opacity-85" [ngClass]="ratio.cssClass"></div>
                </div>
                <div class="min-w-0">
                  <div class="text-xs font-bold font-mono text-gray-200 leading-none mb-1">{{ ratio.label }}</div>
                  <div class="text-[10px] text-gray-400 truncate leading-none">
                    {{ t()['aspectRatio' + ratio.translationKey] || ratio.description }}
                  </div>
                </div>
              </button>
            }
          </div>
        </div>
      </div>

      <!-- Action Submission buttons -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <button
          type="button"
          (click)="submit('png')"
          [disabled]="form.invalid || loading()"
          class="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-950/20"
        >
          @if (loading()) {
            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ t().generatingButton }}</span>
          } @else {
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{{ t().generateButton }}</span>
          }
        </button>

        <button
          type="button"
          (click)="submit('svg')"
          [disabled]="form.invalid || loadingSvg()"
          class="w-full py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-950/20"
        >
          @if (loadingSvg()) {
            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ t().generatingSvgButton }}</span>
          } @else {
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <span>{{ t().generateSvgButton }}</span>
          }
        </button>
      </div>
    </form>
  `
})
export class IconForm implements OnInit, OnChanges {
  t = input.required<any>();
  iconSizes = input.required<any[]>();
  loading = input<boolean>(false);
  loadingSvg = input<boolean>(false);
  initialValues = input<IconFormValues | null>(null);

  formSubmit = output<{ values: IconFormValues; type: 'png' | 'svg' }>();
  valuesChanged = output<IconFormValues>();

  form: FormGroup;

  aspectRatios = [
    { id: '1:1', label: '1:1', description: 'Square (Optimal PWA)', translationKey: '1_1', cssClass: 'w-5 h-5' },
    { id: '16:9', label: '16:9', description: 'Landscape (Splash)', translationKey: '16_9', cssClass: 'w-7 h-4' },
    { id: '4:3', label: '4:3', description: 'Standard (Classic)', translationKey: '4_3', cssClass: 'w-6 h-4.5' },
    { id: '9:16', label: '9:16', description: 'Portrait (Story)', translationKey: '9_16', cssClass: 'w-4 h-7' }
  ];

  constructor() {
    this.form = new FormGroup({
      description: new FormControl('', { validators: [Validators.required] }),
      url: new FormControl('', { 
        validators: [
          Validators.pattern(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/)
        ] 
      }),
      size: new FormControl('512'),
      aspectRatio: new FormControl('1:1')
    });
  }

  ngOnInit(): void {
    // Listen to form value changes to emit back to parent
    this.form.valueChanges.subscribe((vals) => {
      this.valuesChanged.emit({
        description: vals.description || '',
        url: vals.url || '',
        size: vals.size || '512',
        aspectRatio: vals.aspectRatio || '1:1'
      });
    });

    // Populate initial values if provided
    const initVals = this.initialValues();
    if (initVals) {
      this.form.patchValue(initVals, { emitEvent: false });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialValues'] && !changes['initialValues'].firstChange) {
      const currentVal = this.initialValues();
      if (currentVal) {
        // Only patch if values actually differ to avoid infinite signal update loops
        const formVal = this.form.value;
        if (
          currentVal.description !== formVal.description ||
          currentVal.url !== formVal.url ||
          currentVal.size !== formVal.size ||
          currentVal.aspectRatio !== formVal.aspectRatio
        ) {
          this.form.patchValue(currentVal, { emitEvent: false });
        }
      }
    }
  }

  get currentRatio(): string {
    return this.form.get('aspectRatio')?.value || '1:1';
  }

  selectRatio(ratioId: string): void {
    this.form.patchValue({ aspectRatio: ratioId });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  submit(type: 'png' | 'svg'): void {
    if (this.form.valid) {
      const values: IconFormValues = {
        description: this.form.value.description || '',
        url: this.form.value.url || '',
        size: this.form.value.size || '512',
        aspectRatio: this.form.value.aspectRatio || '1:1'
      };
      this.formSubmit.emit({ values, type });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
