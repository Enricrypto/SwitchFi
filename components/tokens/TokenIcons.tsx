// components/tokens/TokenIcons.tsx
import React from 'react';

export const TokenAIcon = () => (
  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
    <span className="text-white text-lg font-bold">A</span>
  </div>
);

export const TokenBIcon = () => (
  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-900 flex items-center justify-center shadow-inner border border-gray-500">
    <span className="text-orange-300 text-lg font-bold">B</span>
  </div>
);

export const TokenCIcon = () => (
  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-600 flex items-center justify-center shadow-md">
    <span className="text-white text-lg font-bold">C</span>
  </div>
);
