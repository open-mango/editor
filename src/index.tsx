import React from 'react';
import {
  Editor,
  EditorState,
  CompositeDecorator,
  Modifier,
  ContentState,
  convertFromHTML,
  getDefaultKeyBinding,
  RichUtils,
  EditorProps,
  DraftHandleValue,
} from 'draft-js';
import { EmojiData } from 'emoji-mart';
import { useDropzone } from 'react-dropzone';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Divider, Paper, Typography } from '@material-ui/core';

import 'emoji-mart/css/emoji-mart.css';

// Plugins
import { hashtagStrategy } from './Plugins/Hashtag/strategy';
import { HashtagSpan } from './Plugins/Hashtag';
// import { emojiStrategy } from './Plugins/Emoji/strategy';
// import { EmojiSpan } from './Plugins/Emoji';

import {
  insertCustomEmoji,
  insertEmoji,
  insertMention,
  removeCurrentBlockText,
} from './EditorUtil';

import Preview, { UploadFile } from './Components/Preview';
import MangoToolbar from './Components/Toolbar';
import { blockRenderMap, styleMap } from './Components/Formater';
import MentionSuggestions, { Mention } from './Components/MentionSuggestions';

export type SyntheticKeyboardEvent = React.KeyboardEvent<{}>;
export type SyntheticEvent = React.SyntheticEvent<{}>;

export { UploadFile, Mention };

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    editor: {
      display: 'flex',
      borderRadius: 0,
      padding: theme.spacing(0.2, 2),
      alignItems: 'center',
    },
    dropContainer: {
      '&:focus': {
        outline: 'none',
      },
    },
    dropCover: {
      position: 'absolute',
      display: 'flex',
      flexDirection: 'column',
      left: 0,
      top: 0,
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.palette.background.paper,
      opacity: '0.9',
      zIndex: 10,
    },
    doverImage: {
      width: 320,
      height: 320,
      marginBottomdd: '1rem',
    },
    typing: {
      height: '1.6rem',
      paddingLeft: theme.spacing(2.5),
    },
    editorContainer: {
      width: '100%',
    },
    editorWrapper: {
      border: '1px solid #ccc',
      borderRadius: theme.shape.borderRadius,
    },
    buttons: {
      marginTop: theme.spacing(1),
      '& button': {
        marginRight: theme.spacing(1),
      },
    },
  })
);

export type EditorMode = 'editor' | 'chat';

export interface MangoEditorProps extends EditorProps {
  editorMode: EditorMode;
  editorRef?: React.RefObject<Editor>;
  mentions?: Mention[];
  onDragDropFiles?: (acceptedFiles: File[]) => UploadFile[];
  onExtraButtonClick?: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
  onHandleKeyBinding?: (e: SyntheticKeyboardEvent) => string | null;
  onHandlePastedText?: (
    text: string,
    html: string | undefined,
    editorState: EditorState
  ) => DraftHandleValue;
  onHandleKeyCommand?: (
    command: string,
    editorState: EditorState,
    eventTimeStamp: number
  ) => DraftHandleValue;
  onHandleReturn?: (
    e: SyntheticKeyboardEvent,
    editorState: EditorState
  ) => DraftHandleValue;
  onHandleBeforeInput?: (
    chars: string,
    editorState: EditorState,
    eventTimeStamp: number
  ) => DraftHandleValue;
  onHandleMentionClick?: (mention: Mention) => void;
}

function MangoEditor(props: MangoEditorProps) {
  const classes = useStyles();
  const {
    editorMode,
    editorRef,
    editorState,
    onChange,
    readOnly,
    mentions,
    onDragDropFiles,
    onExtraButtonClick,
    onHandleKeyBinding,
    onHandlePastedText,
    onHandleKeyCommand,
    onHandleReturn,
    onHandleBeforeInput,
    onHandleMentionClick,
  } = props;
  const [previews, setPreviews] = React.useState<UploadFile[]>([]);
  const [suggestions, setSuggestions] = React.useState<boolean>(false);
  const [search, setSearch] = React.useState<string>('');

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    setPreviews(acceptedFiles as UploadFile[]);
    if (onDragDropFiles) {
      const uploadedFiles = onDragDropFiles(acceptedFiles);
      console.log(uploadedFiles);
      // setPreviews(uploadedFiles)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
  });

  const compositeDecorator = new CompositeDecorator([
    {
      strategy: hashtagStrategy,
      component: HashtagSpan,
    },
    // {
    //   strategy: emojiStrategy,
    //   component: EmojiSpan
    // }
  ]);

  React.useEffect(() => {
    window.addEventListener('keyup', handleKeyUp);
    const newEditorState = EditorState.set(editorState, {
      decorator: compositeDecorator,
    });
    onChange(newEditorState);

    return () => {
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [suggestions]);

  const handleToggleBlockType = (type: string) => {
    onChange(RichUtils.toggleBlockType(editorState, type));
  };

  const handleToggleInlineStyleType = (type: string) => {
    onChange(RichUtils.toggleInlineStyle(editorState, type));
  };

  const handleKeyUp = () => {
    if (!mentions || !suggestions) return;

    const selection = window.getSelection();
    if (!selection) return;

    const range = selection.getRangeAt(0);
    let text = range.startContainer.textContent;

    if (!text) return;
    text = text.substring(0, range.startOffset);

    const index = text.lastIndexOf('@');
    const search = text.substring(index + 1);

    setSearch(search);
  };

  const removeBlockFromBlockmap = (editorState: EditorState, key: string) => {
    const cs = editorState.getCurrentContent();
    const bm = cs.getBlockMap();
    const nbm = bm.remove(key);
    const ncs = cs.merge({
      blockMap: nbm,
    }) as ContentState;

    let nes = null;
    if (ncs.getBlockMap().size < 1) {
      nes = EditorState.push(
        editorState,
        ContentState.createFromText(''),
        'remove-range'
      );
    } else {
      nes = EditorState.push(editorState, ncs, 'remove-range');
    }

    onChange(EditorState.moveFocusToEnd(nes));
  };

  const handleKeyBinding = (e: SyntheticKeyboardEvent) => {
    if (e.metaKey && e.key === 'z') {
      return 'editor-undo';
    }

    return onHandleKeyBinding ? onHandleKeyBinding(e) : getDefaultKeyBinding(e);
  };

  const handleKeyCommand = (
    command: string,
    editorState: EditorState,
    eventTimeStamp: number
  ) => {
    if (command === 'editor-undo') {
      removeBlockFromBlockmap(
        editorState,
        editorState.getSelection().getAnchorKey()
      );

      return 'handled';
    }

    const nes = RichUtils.handleKeyCommand(editorState, command);
    if (nes) {
      onChange(EditorState.moveFocusToEnd(nes));
      return 'handled';
    }

    return onHandleKeyCommand
      ? onHandleKeyCommand(command, editorState, eventTimeStamp)
      : 'not-handled';
  };

  const handlePastedText = (
    text: string,
    html: string | undefined,
    editorState: EditorState
  ) => {
    if (html) {
      const blocksFromHTML = convertFromHTML(html);
      const pastedBlocks = ContentState.createFromBlockArray(
        blocksFromHTML.contentBlocks,
        blocksFromHTML.entityMap
      ).getBlockMap();

      const newState = Modifier.replaceWithFragment(
        editorState.getCurrentContent(),
        editorState.getSelection(),
        pastedBlocks
      );

      const newEditorState = EditorState.push(
        editorState,
        newState,
        'insert-fragment'
      );
      onChange(EditorState.moveFocusToEnd(newEditorState));

      return 'handled';
    }

    if (text) {
      const pastedBlocks = ContentState.createFromText(text).getBlockMap();
      const newState = Modifier.replaceWithFragment(
        editorState.getCurrentContent(),
        editorState.getSelection(),
        pastedBlocks
      );

      const newEditorState = EditorState.push(
        editorState,
        newState,
        'insert-fragment'
      );
      onChange(EditorState.moveFocusToEnd(newEditorState));

      return 'handled';
    }

    return onHandlePastedText
      ? onHandlePastedText(text, html, editorState)
      : 'not-handled';
  };

  const handleReturn = (
    e: SyntheticKeyboardEvent,
    editorState: EditorState
  ) => {
    if (editorMode !== 'editor' && !e.shiftKey) {
      const result = onHandleReturn
        ? onHandleReturn(e, editorState)
        : 'handled';
      setTimeout(() => {
        _clearEditorState(editorState);
      }, 10);
      return result;
    }

    return onHandleReturn ? onHandleReturn(e, editorState) : 'not-handled';
  };

  const handleBeforeInput = (
    chars: string,
    editorState: EditorState,
    eventTimeStamp: number
  ) => {
    if (chars === '@') _mentionShortcut(editorState);
    if (chars === ' ' || chars === '`') {
      return _markdownShortcut(editorState);
    }

    return onHandleBeforeInput
      ? onHandleBeforeInput(chars, editorState, eventTimeStamp)
      : 'not-handled';
  };

  const _mentionShortcut = (editorState: EditorState) => {
    const selection = editorState.getSelection();
    const command = editorState
      .getCurrentContent()
      .getBlockForKey(selection.getStartKey())
      .getText();

    const index = command.lastIndexOf(' ');
    if (index + 1 === command.length) {
      setSuggestions(true);
    }
  };

  const _markdownShortcut = (editorState: EditorState) => {
    const selection = editorState.getSelection();
    const command = editorState
      .getCurrentContent()
      .getBlockForKey(selection.getStartKey())
      .getText();

    switch (command) {
      case '-':
        _smartKeyCommand(
          'block',
          'unordered-list-item',
          removeCurrentBlockText(editorState)
        );
        return 'handled';
      case '>':
        _smartKeyCommand(
          'block',
          'blockquote',
          removeCurrentBlockText(editorState)
        );
        return 'handled';
      case '``':
        _smartKeyCommand(
          'block',
          'code-block',
          removeCurrentBlockText(editorState)
        );
        return 'handled';
      case '*':
        _smartKeyCommand(
          'block',
          'ordered-list-item',
          removeCurrentBlockText(editorState)
        );
        return 'handled';
      default:
        return 'not-handled';
    }
  };

  const _clearEditorState = (editorState: EditorState) => {
    const es = EditorState.push(
      editorState,
      ContentState.createFromText(''),
      'remove-range'
    );
    onChange(EditorState.moveFocusToEnd(es));
  };

  const _smartKeyCommand = (
    type: 'block' | 'inline',
    style: string,
    editorState: EditorState
  ) => {
    if (type === 'block') {
      onChange(
        EditorState.moveFocusToEnd(
          RichUtils.toggleBlockType(editorState, style)
        )
      );
    } else {
      onChange(
        EditorState.moveFocusToEnd(
          RichUtils.toggleInlineStyle(editorState, style)
        )
      );
    }
  };

  const handleAddEmoji = (emoji: EmojiData) => {
    let newEditorState;

    if ('native' in emoji) {
      newEditorState = insertEmoji(editorState, emoji.native);
    } else {
      newEditorState = insertCustomEmoji(editorState, emoji.imageUrl);
    }

    onChange(EditorState.moveFocusToEnd(newEditorState));
  };

  const handleMentionSelect = (mention: Mention) => {
    setSuggestions(false);
    if (onHandleMentionClick) onHandleMentionClick(mention);

    const newEditorState = insertMention(editorState, mention);
    onChange(EditorState.moveFocusToEnd(newEditorState));
  };

  const onRemovePreview = (id: number) => {
    setPreviews(previews.splice(id, 1));
  };

  return (
    <div {...getRootProps({ className: 'dropzone' })}>
      <input {...getInputProps()} />
      <div className={classes.editorContainer}>
        {mentions && suggestions && (
          <MentionSuggestions
            suggestions={mentions}
            search={search}
            onSelect={handleMentionSelect}
          />
        )}
        <div className={readOnly ? '' : classes.editorWrapper}>
          <div style={{ padding: readOnly ? 0 : 14 }}>
            <Editor
              {...props}
              ref={editorRef}
              readOnly={readOnly}
              placeholder={
                editorMode === 'editor'
                  ? 'Document Editor Mode'
                  : 'Chating Editor Mode (Shift+Enter for Newline)'
              }
              editorState={editorState}
              onChange={onChange}
              customStyleMap={styleMap}
              blockRenderMap={blockRenderMap}
              keyBindingFn={handleKeyBinding}
              handleReturn={handleReturn}
              handleKeyCommand={handleKeyCommand}
              handlePastedText={handlePastedText}
              handleBeforeInput={handleBeforeInput}
            />
          </div>
          {!readOnly && (
            <React.Fragment>
              <Preview previews={previews} onRemovePreview={onRemovePreview} />
              <Divider />
              <MangoToolbar
                editorMode={editorMode}
                editorState={editorState}
                onExtraButtonClick={onExtraButtonClick}
                onAddEmoji={handleAddEmoji}
                onToggleInlineStyleType={handleToggleInlineStyleType}
                onToggleBlockStyleType={handleToggleBlockType}
                onFileUploadClick={open}
              />
            </React.Fragment>
          )}
        </div>
      </div>
      {isDragActive && (
        <Paper elevation={0} className={classes.dropCover}>
          <img
            className={classes.doverImage}
            src="https://st-kr-tutor.s3-ap-northeast-2.amazonaws.com/got/909a673119ed00a5ecdb45e18a0606ab/upload.svg"
            alt={'Drag & Drop file upload'}
          />
          <Typography component="h5" variant="h5">
            Drag &amp; Drop file upload
          </Typography>
        </Paper>
      )}
    </div>
  );
}

export default MangoEditor;
