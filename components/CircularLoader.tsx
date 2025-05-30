import styles from '@components/CircularLoader.module.scss';

import * as React from 'react';

export default function CircularProgress() {
  const style = {
    marginTop: 88,
    width: 88,
    height: 88,
    border: `2px solid var(--color-blue-50)`,
    borderTopColor: `var(--color-blue-90)`,
  };

  return <div className={styles.progress} style={style} />;
}
