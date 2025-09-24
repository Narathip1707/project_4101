import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md animate-scaleIn hover-lift">
        <h1 className="text-3xl font-bold mb-6 text-center text-black animate-fadeInDown">
          {title}
        </h1>
        {subtitle && (
          <p className="text-gray-600 text-center mb-6 animate-fadeInDown animate-delay-100">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </div>
  );
};

interface FormContainerProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
}

export const FormContainer: React.FC<FormContainerProps> = ({ children, onSubmit }) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {children}
    </form>
  );
};

interface LinkTextProps {
  text: string;
  linkText: string;
  href: string;
  animationDelay?: string;
}

export const LinkText: React.FC<LinkTextProps> = ({ text, linkText, href, animationDelay = '' }) => {
  return (
    <div className={`mt-6 text-center animate-fadeInUp ${animationDelay}`}>
      <p className="text-gray-600">
        {text}{" "}
        <a href={href} className="text-blue-500 hover:text-blue-700 transition-colors duration-300 font-medium">
          {linkText}
        </a>
      </p>
    </div>
  );
};
