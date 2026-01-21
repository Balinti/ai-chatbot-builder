'use client';

interface SoftSavePromptProps {
  onDismiss: () => void;
}

export default function SoftSavePrompt({ onDismiss }: SoftSavePromptProps) {
  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50 animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-900">
            Save your progress
          </h4>
          <p className="text-xs text-gray-500 mt-1">
            Sign in with Google to save your policies and simulation history to the cloud.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => {
                // Trigger sign in - look for GoogleAuth button
                const authButton = document.querySelector('[data-auth-button]');
                if (authButton instanceof HTMLButtonElement) {
                  authButton.click();
                }
                onDismiss();
              }}
              className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
            >
              Sign in with Google
            </button>
            <button
              onClick={onDismiss}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
