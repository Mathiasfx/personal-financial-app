"use client";

import React from "react";
import {
  useNotification,
  Notification,
  NotificationType,
} from "@/context/NotificationContext";
import { CheckCircle, Error, Warning, Info, Close } from "@mui/icons-material";

const ToastContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  const getIcon = (type: NotificationType) => {
    const iconProps = { className: "w-6 h-6" };

    switch (type) {
      case "success":
        return (
          <CheckCircle {...iconProps} className="w-6 h-6 text-green-600" />
        );
      case "error":
        return <Error {...iconProps} className="w-6 h-6 text-red-600" />;
      case "warning":
        return <Warning {...iconProps} className="w-6 h-6 text-yellow-600" />;
      case "info":
        return <Info {...iconProps} className="w-6 h-6 text-blue-600" />;
      default:
        return <Info {...iconProps} className="w-6 h-6 text-gray-600" />;
    }
  };

  const getBackgroundColor = (type: NotificationType) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "info":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  if (notifications.length === 0) return null;
  return (
    <div
      className="fixed top-4 right-4 space-y-2 max-w-sm"
      style={{ zIndex: 1300 }}
    >
      {notifications.map((notification) => (
        <ToastItem
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
          icon={getIcon(notification.type)}
          backgroundColor={getBackgroundColor(notification.type)}
        />
      ))}
    </div>
  );
};

interface ToastItemProps {
  notification: Notification;
  onClose: () => void;
  icon: React.ReactNode;
  backgroundColor: string;
}

const ToastItem: React.FC<ToastItemProps> = ({
  notification,
  onClose,
  icon,
  backgroundColor,
}) => {
  return (
    <div
      className={`${backgroundColor} border rounded-lg shadow-lg p-4 transition-all duration-300 ease-in-out transform animate-slide-in`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">{icon}</div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 mb-1">
            {notification.title}
          </h4>
          {notification.message && (
            <p className="text-sm text-gray-700">{notification.message}</p>
          )}
        </div>

        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 hover:bg-gray-200 rounded-full transition-colors"
          aria-label="Cerrar notificación"
        >
          <Close className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </div>
  );
};

export default ToastContainer;
