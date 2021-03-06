import React from 'react';

const styles = {
  emoji: {
    padding: '0 4px',
  },
};

interface EmojiSpanProps {
  offsetKey: number;
  children: React.ReactNode;
}

export const EmojiSpan = (props: EmojiSpanProps) => {
  return (
    <span style={styles.emoji} data-offset-key={props.offsetKey}>
      {props.children}
    </span>
  );
};
