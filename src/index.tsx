import React from 'react';
import {
  Editor,
  EditorState,
  Modifier,
  ContentState,
  convertFromHTML,
  getDefaultKeyBinding,
  RichUtils,
  EditorProps,
} from 'draft-js';
import { Map } from 'immutable';
import { CompositeDecorator } from 'draft-js';
import { EmojiData } from 'emoji-mart';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Divider } from '@material-ui/core';

import 'emoji-mart/css/emoji-mart.css';

// Plugins
import { hashtagStrategy } from './Plugins/Hashtag/strategy';
import { HashtagSpan } from './Plugins/Hashtag';
// import { emojiStrategy } from './Plugins/Emoji/strategy';
// import { EmojiSpan } from './Plugins/Emoji';

import {
  insertCustomEmoji,
  insertEmoji,
  removeCurrentBlockText,
} from './EditorUtil';
import Preview, { UploadFile } from './Components/Preview';
import MangoToolbar from './Components/Toolbar';
import { styleMap } from './Components/Formater';

export type SyntheticKeyboardEvent = React.KeyboardEvent<{}>;
export type SyntheticEvent = React.SyntheticEvent<{}>;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
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

export interface MangoEditorProps extends EditorProps {
  previews?: UploadFile[];
  onRemovePreview?: (id: number) => void;
  onFileUploadClick?: () => void;
}

function MangoEditor(props: MangoEditorProps) {
  const classes = useStyles();
  const {
    previews,
    editorState,
    onChange,
    readOnly,
    onRemovePreview,
    onFileUploadClick,
  } = props;

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
    const newEditorState = EditorState.set(editorState, {
      decorator: compositeDecorator,
    });
    onChange(newEditorState);
  }, []);

  const blockRenderMap = Map({
    unstyled: {
      element: 'div',
    },
    'code-block': {
      element: 'code',
      wrapper: <pre spellCheck="false" />,
    },
    blockquote: {
      element: 'blockquote',
    },
    'ordered-list-item': {
      element: 'li',
      wrapper: <ol />,
    },
    'unordered-list-item': {
      element: 'li',
      wrapper: <ul />,
    },
  });

  const handleToggleBlockType = (type: string) => {
    onChange(RichUtils.toggleBlockType(editorState, type));
  };

  const handleToggleInlineStyleType = (type: string) => {
    onChange(RichUtils.toggleInlineStyle(editorState, type));
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

    return getDefaultKeyBinding(e);
  };

  const handleKeyCommand = (command: string, editorState: EditorState) => {
    if (command === 'editor-save') {
      _clearEditorState(editorState);
      return 'handled';
    }

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

    return 'not-handled';
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

    return 'not-handled';
  };

  const handleBeforeInput = (
    chars: string,
    editorState: EditorState,
    _eventTimeStamp: number
  ) => {
    if (chars === ' ' || chars === '`') {
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
    }

    return 'not-handled';
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

  const _clearEditorState = (editorState: EditorState) => {
    const es = EditorState.push(
      editorState,
      ContentState.createFromText(''),
      'remove-range'
    );
    onChange(EditorState.moveFocusToEnd(es));
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

  return (
    <div className={classes.editorContainer}>
      <div className={readOnly ? '' : classes.editorWrapper}>
        <div style={{ padding: readOnly ? 0 : 14 }}>
          <Editor
            {...props}
            readOnly={readOnly}
            editorState={editorState}
            onChange={onChange}
            customStyleMap={styleMap}
            blockRenderMap={blockRenderMap}
            keyBindingFn={handleKeyBinding}
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
              editorState={editorState}
              onAddEmoji={handleAddEmoji}
              onToggleInlineStyleType={handleToggleInlineStyleType}
              onToggleBlockStyleType={handleToggleBlockType}
              onFileUploadClick={onFileUploadClick}
            />
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

export default MangoEditor;
