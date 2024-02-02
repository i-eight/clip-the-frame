import { Box, Button, Code, Flex, Text, TextField } from '@radix-ui/themes';
import { AsyncZipOptions, zip } from 'fflate';
import { FC, useCallback, useState } from 'react';

export interface DownloadFormProps {
  canvasIds: string[];
}

function createFilename(
  filename: string,
  index: number,
  digits: number,
): string {
  return `${filename}-${index.toString().padStart(digits, '0')}.png`;
}

function getDataBlob(id: string): Promise<Blob> {
  const canvas = document.getElementById(id) as HTMLCanvasElement;
  if (canvas == null) {
    return Promise.reject(new Error('canvas not found'));
  }
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob == null) {
        reject(new Error('failed to create blob'));
      } else {
        resolve(blob);
      }
    });
  });
}

const zipFilename = 'images.zip';
async function compressImages(
  canvasIds: string[],
  filename: string,
  start: number,
  digits: number,
): Promise<File> {
  try {
    const options: AsyncZipOptions = {};
    const fileContents: Record<string, Uint8Array> = {};
    const promises = canvasIds.map(async (id, index) => {
      const blob = await getDataBlob(id);
      const arrayBuffer = await blob.arrayBuffer();
      const name = createFilename(filename, start + index, digits);
      fileContents[name] = new Uint8Array(arrayBuffer);
    });
    await Promise.all(promises);

    const zippedContent: Uint8Array = await new Promise((resolve, reject) => {
      zip(fileContents, options, (err, data) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      });
    });
    return new File([zippedContent], zipFilename);
  } catch (err) {
    return Promise.reject(new Error(`compress failed: ${err}`));
  }
}

async function createImageFile(
  id: string,
  filename: string,
  start: number,
  digits: number,
): Promise<File> {
  const blob = await getDataBlob(id);
  const name = createFilename(filename, start, digits);
  return new File([blob], name);
}

async function downloadFile(file: File): Promise<void> {
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
}

interface OutputExampleProps {
  filename?: string;
  digits?: number;
  start?: number;
  size: number;
}

const OutputExample: FC<OutputExampleProps> = ({
  filename,
  digits,
  start,
  size,
}) => {
  if (filename == null || filename.length === 0 || size < 1) {
    return null;
  }

  const index = start ?? 1;
  const filenames = [];
  if (size >= 1) {
    filenames.push(<Code>{createFilename(filename, index, digits ?? 3)}</Code>);
  }
  if (size >= 2) {
    filenames.push(', ');
    filenames.push(
      <Code>{createFilename(filename, index + 1, digits ?? 3)}</Code>,
    );
  }
  if (size === 3) {
    filenames.push(', ');
    filenames.push(
      <Code>{createFilename(filename, index + 2, digits ?? 3)}</Code>,
    );
  }
  if (size > 3) {
    filenames.push(', ... ');
    filenames.push(
      <Code>{createFilename(filename, index + size - 1, digits ?? 3)}</Code>,
    );
  }

  return <Text size='2'>ファイル名の出力例： {filenames}</Text>;
};

const DownloadForm: FC<DownloadFormProps> = ({ canvasIds }) => {
  const [filename, setFilename] = useState<string>('image');
  const [digits, setDigits] = useState<number>(3);
  const [start, setStart] = useState<number>(1);

  const handleFilenameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilename(e.target.value);
    },
    [],
  );
  const handleDigitsChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setDigits(Number(e.target.value));
    },
    [],
  );
  const handleStartChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setStart(Number(e.target.value));
    },
    [],
  );

  const handleDownload = useCallback(async () => {
    if (canvasIds.length === 0) {
      return;
    }
    if (canvasIds.length === 1) {
      const file = await createImageFile(canvasIds[0], filename, start, digits);
      await downloadFile(file);
    } else {
      const file = await compressImages(canvasIds, filename, start, digits);
      await downloadFile(file);
    }
  }, [canvasIds, digits, filename, start]);

  return (
    <Flex gap='2' direction='column'>
      <Flex gap='2' align='center'>
        <Text as='label' htmlFor='filename'>
          ファイル名
        </Text>
        <TextField.Input
          id='filename'
          placeholder='Filename prefix'
          value={filename}
          onChange={handleFilenameChange}
        />

        <Text as='label' htmlFor='digits'>
          数字の桁数
        </Text>
        <TextField.Input
          id='digits'
          type='number'
          style={{ width: '3rem' }}
          min={1}
          value={digits}
          onChange={handleDigitsChange}
        />

        <Text as='label' htmlFor='start'>
          最初の数字
        </Text>
        <TextField.Input
          id='start'
          type='number'
          style={{ width: '3rem' }}
          min={1}
          value={start}
          onChange={handleStartChange}
        />
      </Flex>
      <OutputExample
        filename={filename}
        digits={digits}
        start={start}
        size={canvasIds.length}
      />
      <Box>
        <Button
          variant='surface'
          size='3'
          onClick={handleDownload}
          disabled={canvasIds.length === 0}
        >
          ダウンロード
        </Button>
      </Box>
    </Flex>
  );
};

export default DownloadForm;
