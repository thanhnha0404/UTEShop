import React from "react";

export default function Modal({ open, title, description, onClose, actions }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-[90%] max-w-md p-6">
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.172 7.707 8.879a1 1 0 10-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            {title && <h3 className="text-lg font-semibold text-gray-800">{title}</h3>}
            {description && <p className="mt-1 text-gray-600">{description}</p>}
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          {actions}
        </div>
      </div>
    </div>
  );
}



