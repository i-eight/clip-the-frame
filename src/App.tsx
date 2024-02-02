import { Flex } from '@radix-ui/themes';
import React from 'react';
import DetectLine from './components/DetectLine';

const MyComponent: React.FC = () => {
  return (
    <div style={{ width: '100vw' }}>
      <Flex direction='column' gap='2' width='auto' m='4'>
        <DetectLine />
      </Flex>
    </div>
  );
};

export default MyComponent;
