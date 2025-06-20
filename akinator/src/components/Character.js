import React from 'react';
import Lottie from 'react-lottie';
import animationData from '../animations/thinking.json';

function Character() {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  return (
    <div className="mb-8">
      <Lottie options={defaultOptions} height={200} width={200} />
    </div>
  );
}

export default Character;
