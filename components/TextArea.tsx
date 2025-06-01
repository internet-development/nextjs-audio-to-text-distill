import styles from '@components/TextArea.module.scss';

import * as React from 'react';

type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function TextArea(props: TextAreaProps) {
  const textAreaRef = React.useRef<HTMLTextAreaElement | null>(null);

  const resize = () => {
    if (!textAreaRef.current) return;
    textAreaRef.current.style.height = 'auto';
    textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
  };

  React.useEffect(() => {
    resize();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  React.useEffect(() => {
    resize();
  }, [props.value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    resize();
    props.onChange?.(e);
  };

  return <textarea {...props} ref={textAreaRef} onChange={handleChange} className={styles.textArea} style={{ ...props.style }} />;
}
