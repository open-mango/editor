import React from 'react'

const styles = {
  root: {
    fontFamily: '\'Helvetica\', sans-serif',
    padding: 20,
    width: 600,
  },
  editor: {
    border: '1px solid #ddd',
    cursor: 'text',
    fontSize: 16,
    minHeight: 40,
    padding: 10,
  },
  button: {
    marginTop: 10,
    textAlign: 'center',
  },
  handle: {
    color: 'rgba(98, 177, 254, 1.0)',
    direction: 'ltr',
    unicodeBidi: 'bidi-override',
  },
  hashtag: {
    color: 'rgba(95, 184, 138, 1.0)',
  },
};

interface HashtagSpanProps {
  offsetKey: number
  children: React.ReactNode
}

export const HandleSpan = (props: HashtagSpanProps) => {
  return (
    <span
      style={styles.hashtag}
      data-offset-key={props.offsetKey}
    >
      {props.children}
    </span>
  )
}

export const HashtagSpan = (props: HashtagSpanProps) => {
  return (
    <span
      style={styles.hashtag}
      data-offset-key={props.offsetKey}
    >
      {props.children}
    </span>
  );
};
