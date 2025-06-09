import React from "react";

interface ChartContainerProps {
  title: string;
  icon?: string;
  children: React.ReactNode;
  className?: string;
}

const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  icon = "📊",
  children,
  className = "",
}) => {
  return (
    <div className={`bg-white shadow-md rounded-xl p-6 ${className}`}>
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span>{icon}</span>
        {title}
      </h3>
      <div className="w-full">{children}</div>
    </div>
  );
};

export default ChartContainer;
