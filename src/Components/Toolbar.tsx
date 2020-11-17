import React from 'react';
import { EditorState } from 'draft-js';
import { EmojiData } from 'emoji-mart';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { IconButton, Popover, Divider } from '@material-ui/core';

import FlashOnRoundedIcon from '@material-ui/icons/FlashOnRounded';
import FormatSizeRoundedIcon from '@material-ui/icons/FormatSizeRounded';
import AttachFileRoundedIcon from '@material-ui/icons/AttachFileRounded';
import InsertEmoticonRoundedIcon from '@material-ui/icons/InsertEmoticonRounded';
import AlternateEmailRoundedIcon from '@material-ui/icons/AlternateEmailRounded';

import EmojiPicker from './EmojiPicker';
import { BlockStyleControls, InlineStyleControls } from './Formater';

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
  onAddEmoji: (emoji: EmojiData) => void;
  onToggleInlineStyleType: (type: string) => void;
  onToggleBlockStyleType: (type: string) => void;
  onFileUploadClick?: () => void;
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
        <IconButton
          className={classes.button}
          // onClick={handleClickFeacherOpen}
        >
          <FlashOnRoundedIcon fontSize="small" />
        </IconButton>
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
        <Divider orientation="vertical" style={{ height: '75%' }} />
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
        <IconButton className={classes.button}>
          <FormatSizeRoundedIcon fontSize="small" />
        </IconButton>
        {!modifyMode && (
          <IconButton className={classes.button}>
            <AlternateEmailRoundedIcon fontSize="small" />
          </IconButton>
        )}
        <IconButton onClick={handleClickEmojiPicker} className={classes.button}>
          <InsertEmoticonRoundedIcon fontSize="small" />
        </IconButton>
        {!modifyMode && (
          <React.Fragment>
            <IconButton onClick={onFileUploadClick} className={classes.button}>
              <AttachFileRoundedIcon fontSize="small" />
            </IconButton>
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

export default MangoToolbar;
