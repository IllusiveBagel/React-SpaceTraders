import { create } from "zustand";

export type ToastType = "error" | "info" | "success" | "warning";

type Toast = {
    id: string;
    message: string;
    type: ToastType;
    durationMs: number;
};

type ToastState = {
    toasts: Toast[];
    addToast: (message: string, type?: ToastType, durationMs?: number) => void;
    removeToast: (id: string) => void;
    clearToasts: () => void;
};

const generateId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const useToastStore = create<ToastState>((set, get) => ({
    toasts: [],
    addToast: (message, type = "error", durationMs = 5000) => {
        const id = generateId();
        const toast: Toast = { id, message, type, durationMs };

        set((state) => ({
            toasts: [...state.toasts, toast],
        }));

        if (durationMs > 0) {
            window.setTimeout(() => {
                get().removeToast(id);
            }, durationMs);
        }
    },
    removeToast: (id) => {
        set((state) => ({
            toasts: state.toasts.filter((toast) => toast.id !== id),
        }));
    },
    clearToasts: () => {
        set({ toasts: [] });
    },
}));

const showToast = (message: string, type?: ToastType, durationMs?: number) => {
    useToastStore.getState().addToast(message, type, durationMs);
};

export { showToast, useToastStore };
export type { Toast };
