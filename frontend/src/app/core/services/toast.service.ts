import { Injectable, signal } from '@angular/core';

export type ToastKind = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  private sequence = 0;

  show(message: string, kind: ToastKind = 'info'): void {
    const id = ++this.sequence;
    this._toasts.update((items) => [...items, { id, kind, message }]);
    setTimeout(() => this.dismiss(id), 6000);
  }

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error');
  }

  info(message: string): void {
    this.show(message, 'info');
  }

  dismiss(id: number): void {
    this._toasts.update((items) => items.filter((item) => item.id !== id));
  }
}
