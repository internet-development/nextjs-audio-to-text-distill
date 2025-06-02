'use client';

import styles from '@components/Application.module.scss';

import * as React from 'react';
import * as Queries from '@common/queries';
import * as Utilities from '@common/utilities';

import CircularLoader from '@components/CircularLoader';
import ActionUploadButton from '@components/ActionUploadButton';
import TextArea from '@components/TextArea';

const Action = (props) => {
  if (props.disabled) {
    return <span className={styles.actionDisabled}>{props.children}</span>;
  }

  return <span className={styles.action} {...props} />;
};

const File = (props) => {
  if (props.selected) {
    return <div className={styles.selectedFile}>{props.children}</div>;
  }

  return <div className={styles.file} {...props} />;
};

const Copy = (props) => {
  return <div className={styles.copy} {...props} />;
};

const Prompt = (props) => {
  return <TextArea value={props.value} onChange={props.onChange}></TextArea>;
};

export default function Application({ children }) {
  const [prompt, setPrompt] = React.useState('');
  const [current, setCurrent] = React.useState('');
  const [files, setFiles] = React.useState([]);
  const [uploading, setUploading] = React.useState(true);
  const [transcribing, setTranscribing] = React.useState(false);
  const [introspecting, setIntrospecting] = React.useState(false);
  const [transcription, setTranscription] = React.useState('');
  const [introspection, setIntrospection] = React.useState('');

  async function onSelect(name) {
    setCurrent(name);
    setUploading(false);
    setTranscribing(true);
    setIntrospecting(true);

    const response = await Queries.getData({ route: '/api/get-transcription', body: { name } });

    setTranscription(response ? response.data : '');

    const introspectionResponse = await Queries.getData({ route: '/api/get-introspection', body: { name } });

    setIntrospection(introspectionResponse ? introspectionResponse.data : '');

    setTranscribing(false);
    setIntrospecting(false);
  }

  React.useEffect(() => {
    async function init() {
      const promptResponse = await Queries.getData({ route: '/api/get-prompt' });
      if (promptResponse) {
        setPrompt(promptResponse.data);
      }

      const response = await Queries.getData({ route: '/api/list' });

      if (!response) {
        return;
      }

      setFiles(response.data);
      setUploading(false);
    }

    init();
  }, []);

  return (
    <div className={styles.root}>
      <div className={styles.column}>
        <div className={styles.section}>
          <div className={styles.top}>
            <ActionUploadButton
              disabled={uploading || transcribing || introspecting}
              onLoading={() => {
                setUploading(true);
                setTranscribing(true);
                setIntrospection('');
              }}
              onSuccess={async ({ data }) => {
                const response = await Queries.getData({ route: '/api/list' });
                setFiles(response.data);
                setUploading(false);
                setTranscribing(false);
                setIntrospecting(false);
              }}
            />
          </div>
          <div className={styles.bottom}>
            {uploading ? (
              <>
                <CircularLoader />
                <div className={styles.caption}>PLEASE WAIT</div>
              </>
            ) : (
              [...files]

                .filter((each) => each.toLowerCase().endsWith('.wav'))
                .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
                .map((each) => (
                  <File
                    key={each}
                    selected={each === current}
                    onClick={async () => {
                      if (uploading || transcribing || introspecting) {
                        alert('You need to wait till we finish our current task.');
                        return;
                      }
                      await onSelect(each);
                    }}
                  >
                    ⭢ {each}
                  </File>
                ))
            )}
          </div>
        </div>
      </div>
      <div className={styles.column}>
        <div className={styles.section}>
          <div className={styles.top}>
            <Action
              disabled={uploading || transcribing || introspecting}
              onClick={async () => {
                const confirm = window.confirm(`Are you sure you want to transcribe ${current}? This process may take over 5 minutes.`);

                if (!confirm) {
                  return;
                }

                if (Utilities.isEmpty(current)) {
                  alert('You need to select an audio file to create a transcription.');
                  return;
                }

                setTranscribing(true);
                const response = await Queries.getData({ route: '/api/transcribe', body: { name: current } });

                const transcriptionResponse = await Queries.getData({ route: '/api/get-transcription', body: { name: current } });

                setTranscription(transcriptionResponse ? transcriptionResponse.data : '');

                setTranscribing(false);
              }}
            >
              ◎ Transcribe
            </Action>

            {Utilities.isEmpty(transcription) ? null : (
              <Action
                disabled={uploading || transcribing || introspecting}
                onClick={async () => {
                  const confirm = window.confirm('Are you sure you want to introspect on this transcript? This process may take over 5 minutes.');

                  if (!confirm) {
                    return;
                  }

                  if (Utilities.isEmpty(current)) {
                    alert('You need to select an audio file to run a transcription.');
                    return;
                  }

                  setIntrospecting(true);

                  const response = await Queries.getData({ route: '/api/introspect', body: { name: current } });
                  setIntrospection(response ? response.data : '');
                  setIntrospecting(false);
                }}
              >
                ◎ Introspect
              </Action>
            )}
          </div>
          <div className={styles.bottom}>
            <Copy>
              {transcribing ? (
                <>
                  <CircularLoader />
                  <div className={styles.caption}>PLEASE WAIT</div>
                </>
              ) : (
                transcription
              )}
            </Copy>
          </div>
        </div>
      </div>
      <div className={styles.wide}>
        <div className={styles.section}>
          <div className={styles.top}>
            <Action
              disabled={uploading || transcribing || introspecting}
              onClick={async () => {
                const response = await Queries.getData({ route: '/api/update-prompt', body: { prompt } });

                if (response) {
                  alert('Your new prompt is saved.');
                }
              }}
            >
              ◎ Update Default Prompt
            </Action>
          </div>
          <div className={styles.middle}>
            <Prompt value={prompt} onChange={(e) => setPrompt(e.target.value)}></Prompt>
          </div>
          <div className={styles.bottom}>
            <Copy>
              {introspecting ? (
                <>
                  <CircularLoader />
                  <div className={styles.caption}>PLEASE WAIT</div>
                </>
              ) : (
                introspection
              )}
            </Copy>
          </div>
        </div>
      </div>
    </div>
  );
}
