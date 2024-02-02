import { FC, useEffect } from 'react';

export interface LoadScriptProps {
  src: string;
  onReady?: () => void;
}

const LoadScript: FC<LoadScriptProps> = ({ src, onReady }) => {
  useEffect(() => {
    const id = src;
    if (document.getElementById(id) != null) {
      return;
    }

    const script = document.createElement('script');
    script.id = id;
    script.type = 'text/javascript';
    script.src = src;
    script.async = true;
    script.onload = () => {
      onReady?.();
    };
    document.body.appendChild(script);
  }, [onReady, src]);
  return <></>;
};

export default LoadScript;
