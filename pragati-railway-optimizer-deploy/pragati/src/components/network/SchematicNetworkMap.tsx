import React from 'react';
import { BhuvanSatelliteMap } from './BhuvanSatelliteMap';
import { Train, StationNode } from '../../types';

interface SchematicNetworkMapProps {
  interactive?: boolean;
  onSelectTrain?: (train: Train) => void;
  onSelectStation?: (station: StationNode) => void;
  compact?: boolean;
}

export const SchematicNetworkMap: React.FC<SchematicNetworkMapProps> = ({
  compact = false,
  onSelectTrain
}) => {
  return (
    <BhuvanSatelliteMap
      compact={compact}
      onSelectTrain={onSelectTrain}
    />
  );
};
