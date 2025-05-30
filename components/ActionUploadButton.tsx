import styles from '@components/ActionUploadButton.module.scss';

import * as Constants from '@common/constants';
import * as React from 'react';

export default function UploadActionButton(props) {
  const inputRef = React.useRef(null);

  if (props.disabled) {
    return (
      <span className={styles.rootDisabled}>
        <button className={styles.buttonDisabled}>◎ Upload Audio</button>
      </span>
    );
  }

  return (
    <form
      className={styles.root}
      onSubmit={async (e) => {
        e.preventDefault();
      }}
    >
      <input
        ref={inputRef}
        className={styles.input}
        type="file"
        accept="audio/*"
        onChange={async (e) => {
          e.preventDefault();
          if (props.onLoading) {
            props.onLoading();
          }

          let file = e.target.files[0] || null;
          if (!file) {
            alert('You need to provide an audio file.');
            return;
          }

          const formData = new FormData();
          formData.append('file', file);

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          const json = await response.json();
          if (props.onSuccess) {
            await props.onSuccess({ data: json });
          }
        }}
      />
      <button className={styles.button} type="button" onClick={() => inputRef.current && inputRef.current.click()}>
        ◎ Upload Audio
      </button>
    </form>
  );
}
