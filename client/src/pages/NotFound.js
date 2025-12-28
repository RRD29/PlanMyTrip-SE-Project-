import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-4">
      <h1 className="text-8xl md:text-9xl font-extrabold text-blue-600">
        404
      </h1>
      <h2 className="mt-4 text-3xl font-bold text-gray-900 tracking-tight">
        Page Not Found
      </h2>
      <p className="mt-2 text-lg text-gray-600">
        Sorry, we couldn’t find the page you’re looking for.
      </p>
      
      <Button size="lg" className="mt-8">
        {}
        <Link to="/">
          Go back home
        </Link>
      </Button>
    </div>
  );
};

export default NotFound;