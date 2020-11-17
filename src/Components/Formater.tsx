import React from 'react';
import classnames from 'classnames';
import { EditorState } from 'draft-js';

import { IconButton } from '@material-ui/core';
import { orange } from '@material-ui/core/colors';

// inline style buttons
import FormatBoldRoundedIcon from '@material-ui/icons/FormatBoldRounded';
import FormatItalicRoundedIcon from '@material-ui/icons/FormatItalicRounded';
import FormatUnderlinedRoundedIcon from '@material-ui/icons/FormatUnderlinedRounded';
import StrikethroughSRoundedIcon from '@material-ui/icons/StrikethroughSRounded';
import CodeRoundedIcon from '@material-ui/icons/CodeRounded';

// block style buttons
import FormatIndentIncreaseRoundedIcon from '@material-ui/icons/FormatIndentIncreaseRounded';
import FormatListNumberedRoundedIcon from '@material-ui/icons/FormatListNumberedRounded';
import FormatListBulletedRoundedIcon from '@material-ui/icons/FormatListBulletedRounded';
import DeveloperModeRoundedIcon from '@material-ui/icons/DeveloperModeRounded';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

export const styleMap = {
  UNDERLINE: {
    textDecoration: 'underline',
  },
  STRKIETHROUGH: {
    textDecoration: 'line-through',
  },
  CODE: {
    color: orange[600],
    border: '1px solid rgba(0, 0, 0, 0.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    fontSize: '0.75rem',
    paddingLeft: 4,
    paddingRight: 4,
    borderRadius: 4,
  },
};

const BLOCK_TYPES = [
  {
    label: 'BQ',
    style: 'blockquote',
    component: <FormatIndentIncreaseRoundedIcon fontSize="small" />,
  },
  {
    label: 'UL',
    style: 'unordered-list-item',
    component: <FormatListBulletedRoundedIcon fontSize="small" />,
  },
  {
    label: 'OL',
    style: 'ordered-list-item',
    component: <FormatListNumberedRoundedIcon fontSize="small" />,
  },
  {
    label: 'CB',
    style: 'code-block',
    component: <DeveloperModeRoundedIcon fontSize="small" />,
  },
];

const INLINE_STYLES = [
  {
    label: 'B',
    style: 'BOLD',
    component: <FormatBoldRoundedIcon fontSize="small" />,
  },
  {
    label: 'I',
    style: 'ITALIC',
    component: <FormatItalicRoundedIcon fontSize="small" />,
  },
  {
    label: 'S',
    style: 'STRIKETHROUGH',
    component: <StrikethroughSRoundedIcon fontSize="small" />,
  },
  {
    label: 'U',
    style: 'UNDERLINE',
    component: <FormatUnderlinedRoundedIcon fontSize="small" />,
  },
  {
    label: 'C',
    style: 'CODE',
    component: <CodeRoundedIcon fontSize="small" />,
  },
];

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    button: {
      padding: theme.spacing(0.75),
      borderRadius: 2,
      marginRight: 1,
    },
    active: {
      backgroundColor: theme.palette.grey[400],
    },
  })
);

const StyleButton = ({
  label,
  active,
  style,
  component,
  onToggle,
}: {
  label: string;
  active: boolean;
  style: string;
  component: JSX.Element;
  onToggle: (type: string) => void;
}) => {
  const classes = useStyles();

  const styleClasses = classnames({
    [classes.button]: true,
    [classes.active]: active,
  });

  const handleToggle = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    onToggle(style);
  };

  return (
    <IconButton
      className={styleClasses}
      onMouseDown={handleToggle}
      title={label}
    >
      {component}
    </IconButton>
  );
};

export const InlineStyleControls = ({
  editorState,
  onToggle,
}: {
  editorState: EditorState;
  onToggle: (type: string) => void;
}) => {
  const currentStyle = editorState.getCurrentInlineStyle();

  return (
    <div className="RichEditor-controls">
      {INLINE_STYLES.map(type => (
        <StyleButton
          key={type.label}
          active={currentStyle.has(type.style)}
          label={type.label}
          component={type.component}
          onToggle={onToggle}
          style={type.style}
        />
      ))}
    </div>
  );
};

export const BlockStyleControls = ({
  editorState,
  onToggle,
}: {
  editorState: EditorState;
  onToggle: (type: string) => void;
}) => {
  const selection = editorState.getSelection();
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();

  return (
    <div className="RichEditor-controls">
      {BLOCK_TYPES.map(type => (
        <StyleButton
          key={type.label}
          active={type.style === blockType}
          label={type.label}
          component={type.component}
          onToggle={onToggle}
          style={type.style}
        />
      ))}
    </div>
  );
};
