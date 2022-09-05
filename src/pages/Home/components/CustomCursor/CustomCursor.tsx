import { useEffect, useRef } from 'react';
import useMousePosition from '../../hooks/useMousePosition';

import styles from './CustomCursor.module.css';

type CustomCursorProps = {
  text: string;
};

const CustomCursor = ({ text = '' }: CustomCursorProps) => {
  const [...cursorTextChars] = text;
  const mousePosition = useMousePosition();
  const cursorRef = useRef<HTMLDivElement>(null);
  const rAF = useRef<number | null>(null);

  useEffect(() => {
    const cursorAnimationFrame = () => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${mousePosition.pageX}px, ${mousePosition.pageY}px)`;
      }
      requestAnimationFrame(cursorAnimationFrame);
    };

    rAF.current = requestAnimationFrame(cursorAnimationFrame);

    return () => {
      if (!rAF.current) return;
      cancelAnimationFrame(rAF.current);
    };
  }, [mousePosition, cursorRef.current]);

  return (
    <div ref={cursorRef} className={styles.cursor}>
      {cursorTextChars.map((char, index) => (
        <span key={index} className={styles.character}>
          {char}
        </span>
      ))}
    </div>
  );
};

export default CustomCursor;
