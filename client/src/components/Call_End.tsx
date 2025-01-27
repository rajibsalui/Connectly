import React, { useEffect } from 'react';

const CallEnd: React.FC = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.close(); // Close the window after 1 second
      // window.location.href = '/chat'; // Redirect to chat page
    }, 2000); // Redirect after 2 seconds

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-semibold mb-4">Call Ended</h1>
      <p className="text-lg">Redirecting to chat...</p>
      <div className="loader mt-4">
        <div className="flex items-center">
          <div className="spinner-border animate-spin inline-block w-10 h-10 border-4 rounded-full border-blue-500 border-t-transparent" role="status"></div>
          <span className="ml-3 text-lg">Please wait...</span>
        </div>
      </div>
    </div>
  );
};

export default CallEnd;
