import React from 'react';

interface InputFieldProps {
  label: string;
  icon?: string;
  type?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  animationDelay?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  icon,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required = false,
  animationDelay = ''
}) => {
  return (
    <div className={`animate-fadeInLeft ${animationDelay}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {icon && `${icon} `}{label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 text-black placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
        placeholder={placeholder}
      />
    </div>
  );
};

interface SelectFieldProps {
  label: string;
  icon?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  animationDelay?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  icon,
  name,
  value,
  onChange,
  options,
  animationDelay = ''
}) => {
  return (
    <div className={`animate-fadeInLeft ${animationDelay}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {icon && `${icon} `}{label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

interface ButtonProps {
  type?: 'button' | 'submit' | 'reset';
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  animationDelay?: string;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  type = 'button',
  children,
  onClick,
  variant = 'primary',
  animationDelay = '',
  disabled = false
}) => {
  const baseClasses = "w-full py-3 rounded-lg font-semibold hover-lift glow transition-all duration-300";
  const variantClasses = {
    primary: "bg-green-500 text-white hover:bg-green-600",
    secondary: "bg-gray-500 text-white hover:bg-gray-600"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} animate-fadeInUp ${animationDelay} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  if (!message) return null;
  
  return (
    <p className="text-red-500 text-sm animate-fadeInUp bg-red-50 p-3 rounded-md border border-red-200">
      ❌ {message}
    </p>
  );
};
