import * as React from 'react';
import Dropzone from 'react-dropzone';

const classNames = (base, conds) =>
  Object.keys(conds).reduce(
    (acc, key) => `${acc} ${conds[key] ? key : ''}`,
    base
  );

type Props = {
  message?: string;
  onDrop: (acceptedFiles, rejectedFiles) => void;
  currentFiles: File[];
};

export const Upload: React.StatelessComponent<Props> = props => {
  const { currentFiles, onDrop } = props;
  return (
    <Dropzone accept=".docx" onDrop={onDrop}>
      {({ getRootProps, getInputProps, isDragActive }) => {
        return (
          <div
            {...getRootProps()}
            className={classNames('dropzone', {
              'dropzone--isActive': isDragActive,
            })}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop files here...</p>
            ) : currentFiles.length ? (
              currentFiles.map((f, idx) => <p key={idx}>{f.name}</p>)
            ) : (
              <p>
                Drag some files here, or click to manually select files. Only
                .docx files supported.
              </p>
            )}
          </div>
        );
      }}
    </Dropzone>
  );
};
