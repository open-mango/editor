import React from 'react';
import { EditorState } from 'draft-js';
import { EmojiData } from 'emoji-mart';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { IconButton, Popover, Divider, Tooltip } from '@material-ui/core';

import FlashOnRoundedIcon from '@material-ui/icons/FlashOnRounded';
import FormatSizeRoundedIcon from '@material-ui/icons/FormatSizeRounded';
import AttachFileRoundedIcon from '@material-ui/icons/AttachFileRounded';
import InsertEmoticonRoundedIcon from '@material-ui/icons/InsertEmoticonRounded';
import AlternateEmailRoundedIcon from '@material-ui/icons/AlternateEmailRounded';

import EmojiPicker from './EmojiPicker';
import { BlockStyleControls, InlineStyleControls } from './Formater';
import { EditorMode } from '..';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    toolbar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 3,
    },
    button: {
      padding: theme.spacing(0.75),
      borderRadius: 2,
      marginRight: 1,
    },
    format: {
      display: 'flex',
      alignItems: 'center',
      height: '30px',
    },
    action: {
      flex: 1,
      textAlign: 'right',
    },
    buttons: {
      marginTop: theme.spacing(1),
      '& button': {
        marginRight: theme.spacing(1),
      },
    },
  })
);

interface MangoToolbarProps {
  editorState: EditorState;
  modifyMode?: boolean;
  editorMode: EditorMode;
  onAddEmoji: (emoji: EmojiData) => void;
  onToggleInlineStyleType: (type: string) => void;
  onToggleBlockStyleType: (type: string) => void;
  onFileUploadClick?: () => void;
  onExtraButtonClick?: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
}

function MangoToolbar(props: MangoToolbarProps) {
  const classes = useStyles();
  const {
    editorState,
    modifyMode,
    onAddEmoji,
    onToggleInlineStyleType,
    onToggleBlockStyleType,
    onFileUploadClick,
    onExtraButtonClick,
  } = props;
  const [
    emojiPickerEl,
    setEmojiPickerEl,
  ] = React.useState<HTMLButtonElement | null>(null);

  const handleClickEmojiPicker = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setEmojiPickerEl(event.currentTarget);
  };

  const handleEmojiPickerClose = () => {
    setEmojiPickerEl(null);
  };

  const openEmojiPicker = Boolean(emojiPickerEl);

  return (
    <div className={classes.toolbar}>
      <div className={classes.format}>
        {onExtraButtonClick && (
          <React.Fragment>
            <Tooltip title="Extra Button">
              <IconButton
                className={classes.button}
                onClick={onExtraButtonClick}
              >
                <FlashOnRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Divider orientation="vertical" style={{ height: '75%' }} />
          </React.Fragment>
        )}
        <Popover
          id="emoji-picker-popover"
          open={openEmojiPicker}
          anchorEl={emojiPickerEl}
          onClose={handleEmojiPickerClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'center',
            horizontal: 'right',
          }}
        >
          <EmojiPicker onSelect={onAddEmoji} />
        </Popover>
        <InlineStyleControls
          editorState={editorState}
          onToggle={onToggleInlineStyleType}
        />
        <BlockStyleControls
          editorState={editorState}
          onToggle={onToggleBlockStyleType}
        />
      </div>
      <div className={classes.action}>
        <Tooltip title="Formatter">
          <IconButton className={classes.button}>
            <FormatSizeRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        {!modifyMode && (
          <Tooltip title="Mention">
            <IconButton className={classes.button}>
              <AlternateEmailRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="Emoji">
          <IconButton
            onClick={handleClickEmojiPicker}
            className={classes.button}
          >
            <InsertEmoticonRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        {!modifyMode && (
          <Tooltip title="File Upload">
            <IconButton onClick={onFileUploadClick} className={classes.button}>
              <AttachFileRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

export default MangoToolbar;
