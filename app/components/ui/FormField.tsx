import { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  children?: ReactNode;
}

export const FormField = ({
  label,
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  children,
}: FormFieldProps) => {
  const isTextarea = type === "textarea";
  return (
    <div className="space-y-1">
      {/* Label with required asterisk */}
      <label
        htmlFor={id}
        className="flex items-center text-sm font-medium text-foreground"
      >
        <span>{label}</span>
        {required && <span className="ml-1 text-destructive">*</span>}
      </label>

      {/* Either custom children or default input */}
      {children ??
        (isTextarea ? (
          <textarea
            id={id}
            name={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            rows={6}
            className="
              w-full rounded-md border border-input bg-background
              px-3 py-2 text-base focus-visible:outline-blue-400
              md:text-sm transition-smooth focus:shadow-xl
            "
          />
        ) : (
          <input
            id={id}
            name={id}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            className="
              w-full h-10 rounded-md border border-input bg-background
              px-3 text-base focus-visible:outline-blue-400
              md:text-sm transition-smooth focus:shadow-xl
            "
          />
        ))}
    </div>
  );
};
