import { Injectable, signal } from '@angular/core';

interface ProgressStep {
  id: string;
  label: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProgressService {
  // State
  private progress = signal<number>(0);
  private currentStep = signal<string>('');
  private steps = signal<ProgressStep[]>([]);
  private isActive = signal<boolean>(false);
  private error = signal<string | null>(null);
  
  // Timer for auto-progress
  private progressInterval: any = null;
  
  constructor() {}
  
  /**
   * Start progress tracking
   */
  start(steps: ProgressStep[], initialStep: string = ''): void {
    this.steps.set(steps);
    this.progress.set(0);
    this.currentStep.set(initialStep || steps[0]?.id || '');
    this.isActive.set(true);
    this.error.set(null);
    
    // Clear any existing interval
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
    
    // Start auto-progress
    this.startAutoProgress();
  }
  
  /**
   * Update progress manually
   */
  update(progress: number, stepId?: string): void {
    this.progress.set(Math.min(100, Math.max(0, progress)));
    
    if (stepId) {
      this.currentStep.set(stepId);
    } else {
      // Auto-determine step based on progress
      const steps = this.steps();
      if (steps.length > 0) {
        const stepIndex = Math.floor((progress / 100) * steps.length);
        this.currentStep.set(steps[Math.min(stepIndex, steps.length - 1)].id);
      }
    }
  }
  
  /**
   * Move to next step
   */
  nextStep(): void {
    const steps = this.steps();
    const currentIndex = steps.findIndex(s => s.id === this.currentStep());
    
    if (currentIndex < steps.length - 1) {
      this.currentStep.set(steps[currentIndex + 1].id);
      this.progress.set(((currentIndex + 1) / steps.length) * 100);
    } else {
      this.complete();
    }
  }
  
  /**
   * Complete progress
   */
  complete(): void {
    this.progress.set(100);
    const steps = this.steps();
    if (steps.length > 0) {
      this.currentStep.set(steps[steps.length - 1].id);
    }
    this.stop();
  }
  
  /**
   * Stop progress tracking
   */
  stop(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
    this.isActive.set(false);
  }
  
  /**
   * Reset progress
   */
  reset(): void {
    this.stop();
    this.progress.set(0);
    this.currentStep.set('');
    this.steps.set([]);
    this.error.set(null);
  }
  
  /**
   * Set an error
   */
  setError(error: string): void {
    this.error.set(error);
    this.stop();
  }
  
  /**
   * Clear error
   */
  clearError(): void {
    this.error.set(null);
  }
  
  /**
   * Get current progress
   */
  getProgress(): number {
    return this.progress();
  }
  
  /**
   * Get current step
   */
  getCurrentStep(): string {
    return this.currentStep();
  }
  
  /**
   * Get all steps
   */
  getSteps(): ProgressStep[] {
    return this.steps();
  }
  
  /**
   * Check if progress is active
   */
  isProgressActive(): boolean {
    return this.isActive();
  }
  
  /**
   * Get error
   */
  getError(): string | null {
    return this.error();
  }
  
  /**
   * Get current step index
   */
  getCurrentStepIndex(): number {
    const steps = this.steps();
    return steps.findIndex(s => s.id === this.currentStep());
  }
  
  /**
   * Get current step info
   */
  getCurrentStepInfo(): ProgressStep | null {
    const steps = this.steps();
    return steps.find(s => s.id === this.currentStep()) || null;
  }
  
  /**
   * Start auto-progress simulation
   */
  private startAutoProgress(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
    
    this.progressInterval = setInterval(() => {
      const currentProgress = this.progress();
      if (currentProgress < 95) {
        const increment = currentProgress < 30 ? 2 : (currentProgress < 70 ? 1 : 0.5);
        this.progress.update(p => Math.min(95, p + increment));
        
        // Update step based on progress
        const steps = this.steps();
        if (steps.length > 0) {
          const stepIndex = Math.floor((this.progress() / 100) * steps.length);
          this.currentStep.set(steps[Math.min(stepIndex, steps.length - 1)].id);
        }
      }
    }, 200);
  }
}
