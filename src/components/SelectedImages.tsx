import { Cross2Icon } from '@radix-ui/react-icons';
import { Card, Flex, IconButton } from '@radix-ui/themes';
import { nanoid } from 'nanoid';
import {
  CSSProperties,
  Dispatch,
  FC,
  SetStateAction,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';

export interface SelectedImagesProps {
  canvasIds: string[];
  setCanvasIds: Dispatch<SetStateAction<string[]>>;
  onAddNewRow(id: string): void;
}

export interface SelectedImagesRef {
  initialize: (id: string, height: number, width: number) => void;
}

interface ImageDetail {
  initialized: boolean;
  key: string;
  height: number;
  width: number;
}

interface ImageRowProps {
  index: number;
  image: ImageDetail;
  onDeleteRow: () => void;
}

const hideStyle: CSSProperties = {
  height: 0,
  marginTop: '-8px',
};

const ImageRow: FC<ImageRowProps> = ({ index, image, onDeleteRow }) => {
  return (
    <Card
      style={{
        backgroundColor: 'var(--gray-a3)',
        order: -1 * index,
        ...(image.initialized ? {} : hideStyle),
      }}
    >
      <Flex gap='1'>
        {image.initialized ? (
          <>
            {index + 1}.
            <IconButton color='red' style={{ order: 9 }} onClick={onDeleteRow}>
              <Cross2Icon />
            </IconButton>
          </>
        ) : null}
        <canvas id={image.key} height={image.height} width={image.width} />
      </Flex>
    </Card>
  );
};

function createNewRow() {
  const id = nanoid(10);
  return {
    initialized: false,
    key: id,
    height: 0,
    width: 0,
  };
}

const SelectedImages = forwardRef<SelectedImagesRef, SelectedImagesProps>(
  ({ canvasIds, setCanvasIds, onAddNewRow }, ref) => {
    const [tempId, setTempId] = useState<string>();
    const [images, setImages] = useState<Record<string, ImageDetail>>({});

    const addNewRow = useCallback(() => {
      const newRow = createNewRow();
      setTempId(newRow.key);
      setImages({ ...images, [newRow.key]: newRow });
      onAddNewRow(newRow.key);
    }, [images, onAddNewRow]);

    useImperativeHandle(
      ref,
      () => ({
        initialize: (id: string, height: number, width: number) => {
          const data = images[id];
          data.initialized = true;
          data.height = height;
          data.width = width;

          setCanvasIds([...canvasIds, id]);
          addNewRow();
        },
      }),
      [addNewRow, canvasIds, images, setCanvasIds],
    );

    useEffect(() => {
      if (tempId == null) {
        addNewRow();
      }
    }, [addNewRow, tempId]);

    const onDeleteRow = useCallback(
      (index: number) => () => {
        const newIds = [...canvasIds];
        const deleted = newIds.splice(index, 1);
        setCanvasIds(newIds);
        const newImages = { ...images };
        delete newImages[deleted[0]];
        setImages(newImages);
      },
      [canvasIds, images, setCanvasIds],
    );

    return (
      <Flex direction='column' gap='2'>
        {canvasIds.map((id, index) => (
          <ImageRow
            key={id}
            index={index}
            image={images[id]}
            onDeleteRow={onDeleteRow(index)}
          />
        ))}
        {tempId != null ? (
          <ImageRow
            key={tempId}
            index={canvasIds.length}
            image={images[tempId]}
            onDeleteRow={onDeleteRow(-1)}
          />
        ) : null}
      </Flex>
    );
  },
);

export default SelectedImages;
