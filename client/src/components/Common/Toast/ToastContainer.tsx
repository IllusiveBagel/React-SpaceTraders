import { useToastStore } from "store/toastStore";

import styles from "./ToastContainer.module.css";

const ToastContainer = () => {
    const toasts = useToastStore((state) => state.toasts);
    const removeToast = useToastStore((state) => state.removeToast);

    if (toasts.length === 0) {
        return null;
    }

    return (
        <div className={styles.viewport} aria-live="polite">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`${styles.toast} ${styles[toast.type]}`}
                    role={toast.type === "error" ? "alert" : "status"}
                >
                    <p className={styles.message}>{toast.message}</p>
                    <button
                        type="button"
                        className={styles.closeButton}
                        onClick={() => removeToast(toast.id)}
                        aria-label="Dismiss notification"
                    >
                        x
                    </button>
                </div>
            ))}
        </div>
    );
};

export default ToastContainer;
