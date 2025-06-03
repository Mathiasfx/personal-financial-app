"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type NotificationType = "success" | "error" | "warning" | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  autoClose?: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (notification: Omit<Notification, "id">) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const showNotification = (notification: Omit<Notification, "id">) => {
    const id = generateId();
    const newNotification: Notification = {
      id,
      duration: 5000,
      autoClose: true,
      ...notification,
    };

    setNotifications((prev) => [...prev, newNotification]);

    // Auto-remove notification if autoClose is true
    if (newNotification.autoClose) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
  };

  const showSuccess = (title: string, message?: string) => {
    showNotification({ type: "success", title, message });
  };

  const showError = (title: string, message?: string) => {
    showNotification({ type: "error", title, message });
  };

  const showWarning = (title: string, message?: string) => {
    showNotification({ type: "warning", title, message });
  };

  const showInfo = (title: string, message?: string) => {
    showNotification({ type: "info", title, message });
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        showNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        removeNotification,
        clearAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification debe usarse dentro de un NotificationProvider"
    );
  }
  return context;
};
