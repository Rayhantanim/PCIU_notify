// src/components/ResponsiveContainer.jsx
import React from 'react';

const ResponsiveContainer = ({ children, className = "" }) => {
  return (
    <div className={`container-responsive px-4 sm:px-6 lg:px-8 mx-auto ${className}`}>
      {children}
    </div>
  );
};

export default ResponsiveContainer;