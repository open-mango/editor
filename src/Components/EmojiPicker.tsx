import React from 'react';
import { Picker, PickerProps, EmojiData } from 'emoji-mart';

interface EmojiPickerProps extends PickerProps {
  onSelect: (emoji: EmojiData) => void;
}

function EmojiPicker({ onSelect }: EmojiPickerProps) {
  return <Picker set="apple" onSelect={onSelect} />;
}

export default EmojiPicker;
