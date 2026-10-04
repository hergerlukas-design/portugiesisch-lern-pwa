import React from 'react';
import type { Direction } from '../types';
import { Segmented } from './Segmented';

interface DirectionToggleProps {
  direction: Direction;
  onDirectionChange: (direction: Direction) => void;
}

const DIRECTIONS: { id: Direction; label: string }[] = [
  { id: 'de-pt', label: 'DE → PT' },
  { id: 'pt-de', label: 'PT → DE' },
];

export const DirectionToggle: React.FC<DirectionToggleProps> = ({ direction, onDirectionChange }) => (
  <Segmented options={DIRECTIONS} value={direction} onChange={onDirectionChange} label="Lernrichtung" />
);

export default DirectionToggle;
