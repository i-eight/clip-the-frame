import { type Mat } from 'mirada/dist/src/types/opencv';
import React, { useCallback, useRef, useState } from 'react';
import { Box, Container, Flex, Tabs } from '@radix-ui/themes';
import LoadScript from './LoadScript';
import DndFile from './DndFile';
import SelectedImages, { SelectedImagesRef } from './SelectedImages';
import DownloadForm from './DownloadForm';

function detectLines(img: HTMLImageElement): { xs: number[]; ys: number[] } {
  const src = cv.imread(img);
  cv.imshow('preview', src);

  const copy = new cv.Mat();
  cv.cvtColor(src, copy, cv.COLOR_RGBA2GRAY);
  {
    const sobelX = new cv.Mat();
    cv.Sobel(copy, sobelX, cv.CV_8U, 1, 0, 3, 1, 0, cv.BORDER_DEFAULT);
    const sobelY = new cv.Mat();
    cv.Sobel(copy, sobelY, cv.CV_8U, 0, 1, 3, 1, 0, cv.BORDER_DEFAULT);
    cv.add(sobelX, sobelY, copy);
    sobelX.delete();
    sobelY.delete();
  }
  // cv.imshow('preview2', copy);

  const xLines = new cv.Mat();
  const yLines = new cv.Mat();
  // const dst = cv.Mat.zeros(copy.rows, copy.cols, cv.CV_8UC3);
  // const color = new cv.Scalar(255, 0, 0);

  cv.HoughLines(
    copy,
    xLines,
    1,
    Math.PI / 2,
    copy.rows * 0.8,
    0,
    0,
    0,
    Math.PI / 2,
  );
  cv.HoughLines(
    copy,
    yLines,
    1,
    Math.PI / 2,
    copy.cols * 0.8,
    0,
    0,
    Math.PI / 2,
    Math.PI,
  );
  // function writeLine(rho: number, theta: number) {
  //   const a = Math.cos(theta);
  //   const b = Math.sin(theta);
  //   const x0 = a * rho;
  //   const y0 = b * rho;
  //   const startPoint = new cv.Point(x0 - 1000 * b, y0 + 1000 * a);
  //   const endPoint = new cv.Point(x0 + 1000 * b, y0 - 1000 * a);
  //   cv.line(dst, startPoint, endPoint, color);
  // }

  function sortCoord(lines: Mat, trigF: (n: number) => number): number[] {
    const res = [];
    for (let i = 0; i < lines.rows; ++i) {
      const rho = lines.data32F[i * 2];
      const theta = lines.data32F[i * 2 + 1];
      // writeLine(rho, theta);
      const v = Math.round(trigF(theta) * rho);
      res.push(v);
    }
    res.sort((a, b) => a - b);
    return res;
  }
  const xs = sortCoord(xLines, Math.cos);
  const ys = sortCoord(yLines, Math.sin);
  // cv.imshow('result', dst);
  // dst.delete();

  src.delete();
  copy.delete();
  xLines.delete();
  yLines.delete();

  return { xs, ys };
}

function detectRect(
  lines: { xs: number[]; ys: number[] },
  x: number,
  y: number,
) {
  const { xs, ys } = lines;
  const xi = xs.findIndex((v) => v >= x);
  if (xi <= 0) {
    return;
  }
  const yi = ys.findIndex((v) => v >= y);
  if (yi <= 0) {
    return;
  }

  return {
    x: xs[xi - 1],
    y: ys[yi - 1],
    width: xs[xi] - xs[xi - 1],
    height: ys[yi] - ys[yi - 1],
  };
}

const DetectLine = () => {
  const [initialized, setInitialized] = useState(false);
  const onReadyCV = useCallback(() => {
    cv.onRuntimeInitialized = () => {
      setInitialized(true);
    };
  }, []);

  const [canvasIds, setCanvasIds] = useState<string[]>([]);
  const [newCanvasId, setNewCanvasId] = useState<string>();
  const onAddNewRow = useCallback((id: string) => {
    setNewCanvasId(id);
  }, []);

  const ref = useRef({} as SelectedImagesRef);

  const [lines, setLines] = useState<{ xs: number[]; ys: number[] }>();
  const onChangeFile = useCallback(
    (file: File | undefined) => {
      if (!initialized) {
        return;
      }
      if (!file) {
        return;
      }

      const img = new Image();
      img.onload = () => {
        const res = detectLines(img);
        console.log('detected', res);
        setLines(res);
      };
      img.src = URL.createObjectURL(file);
    },
    [initialized],
  );

  const onSelectPoint = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (lines == null) {
        return;
      }

      const canvas = e.target as HTMLCanvasElement;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        return;
      }

      if (newCanvasId == null) {
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const res = detectRect(lines, x, y);
      console.log(lines, x, y, res);
      if (res == null) {
        return;
      }

      const imageData = ctx.getImageData(res.x, res.y, res.width, res.height);
      // $selected.width = res.width;
      // $selected.height = res.height;

      ref.current.initialize(newCanvasId, res.height, res.width);
      setTimeout(() => {
        const $selected = document.getElementById(
          newCanvasId,
        ) as HTMLCanvasElement | null;
        const ctx2 = $selected?.getContext('2d');
        if (!$selected || !ctx2) {
          return;
        }

        ctx2.putImageData(imageData, 0, 0);
      }, 1);
    },
    [newCanvasId, lines],
  );

  return (
    <>
      <LoadScript src='/lib/opencv.js' onReady={onReadyCV} />
      <Box>
        <Tabs.Root defaultValue='input'>
          <Tabs.List aria-label='tabs'>
            <Tabs.Trigger value='input'>画像読み込み</Tabs.Trigger>
            <Tabs.Trigger value='output'>画像Download</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value='input'>
            <Box pt='2' style={{ height: '128px' }}>
              <DndFile onChangeFile={onChangeFile} disabled={!initialized} />
            </Box>
          </Tabs.Content>
          <Tabs.Content value='output'>
            <Box pt='2' style={{ height: '128px' }}>
              <DownloadForm canvasIds={canvasIds} />
            </Box>
          </Tabs.Content>
        </Tabs.Root>
      </Box>
      <Flex gap='3' align='start' style={{ overflowX: 'scroll' }}>
        <Container
          style={{
            flexGrow: 0,
            border: lines == null ? 'none' : '1px solid var(--gray-5)',
          }}
        >
          <canvas
            id='preview'
            style={{ cursor: 'pointer' }}
            onClick={onSelectPoint}
          />
        </Container>
        <SelectedImages
          ref={ref}
          canvasIds={canvasIds}
          setCanvasIds={setCanvasIds}
          onAddNewRow={onAddNewRow}
        />
      </Flex>
    </>
  );
};

export default DetectLine;
