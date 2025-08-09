"use client";

import React, { InputHTMLAttributes } from "react";

interface FromInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  /**
   * Pass icon as a JSX element, e.g.:
   * icon={<Mail className="h-5 w-5 text-gray-400" />}
   */
  icon?: React.ReactNode;
}

export default function FormInput({
  label,
  error,
  icon,
  type = "text",
  className = "",
  id,
  ...props
}: FromInputProps) {
  const inputId = id ?? (props.name as string) ?? undefined;

  const baseClasses =
    "w-full rounded-md border px-4 py-2 text-sm focus:outline-none focus:ring-2 transition";
  const stateClasses = error
    ? "border-red-500 focus:ring-red-500"
    : "border-gray-300 focus:ring-indigo-500";

  // if icon exists, add left padding to the input so text doesn't overlap the icon
  const withIcon = icon ? "pl-10" : "";

  return (
    <div className="mb-4">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium mb-1 text-gray-700"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {/* Icon area (absolute) */}
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}

        <input
          id={inputId}
          type={type}
          className={`${baseClasses} ${stateClasses} ${withIcon} ${className}`}
          {...props}
        />
      </div>

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
