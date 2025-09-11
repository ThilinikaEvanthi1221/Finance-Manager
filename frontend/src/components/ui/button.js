import React from 'react';

const Button = ({ children, ...props }) => {
  return (
    <button {...props} className={props.className || 'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'}>
      {children}
    </button>
  );
};

export default Button;
