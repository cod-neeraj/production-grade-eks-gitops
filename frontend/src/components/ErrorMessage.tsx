import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4 flex items-start gap-3">
      <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
      <div className="flex-1">
        <p className="text-sm font-medium text-red-800">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-xs font-semibold text-red-700 hover:text-red-900 underline"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};
