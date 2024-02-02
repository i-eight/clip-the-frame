import { CSSProperties, FC, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';

export interface DndFileProps {
  onChangeFile(file: File | undefined): void;
  disabled: boolean;
}

const baseStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  backgroundColor: 'var(--gray-a2)',
  borderColor: 'var(--gray-7)',
  borderStyle: 'dashed',
  borderWidth: '2px',
  borderRadius: '4px',
  outline: 'none',
  transition: 'border .3s ease-in-out',
};

const acceptStyle = {
  borderColor: 'var(--accent-7)',
};

const rejectStyle = {
  borderColor: 'var(--red-7)',
};

const DndFile: FC<DndFileProps> = ({ onChangeFile, disabled }) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onChangeFile(acceptedFiles[0]);
    },
    [onChangeFile],
  );
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isFocused,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    onDrop,
    disabled,
    maxFiles: 1,
    multiple: false,
    accept: { 'image/*': [] },
  });
  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isFocused ? acceptStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isFocused, isDragAccept, isDragReject],
  );

  return (
    <div {...getRootProps({ style })}>
      <input {...getInputProps()} />
      {disabled ? (
        <p></p>
      ) : isDragActive ? (
        <p>画像をここにドロップして下さい。</p>
      ) : (
        <p>読み込む画像を選択、またはドラッグ&ドロップして下さい。</p>
      )}
    </div>
  );
};

export default DndFile;
