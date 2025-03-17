import React from 'react';
import { useRouteError } from 'react-router-dom';

const SomethingWrong = () => {
  const error = useRouteError();
  console.error(error);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Oops!</h1>
      <p className="text-xl mb-4">Something went wrong.</p>
      <p className="text-gray-600">
        {error?.statusText || error?.message || "An unexpected error occurred"}
      </p>
      <button 
        className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={() => window.location.href = '/'}
      >
        Go to Home
      </button>
    </div>
  );
};

export default SomethingWrong;
