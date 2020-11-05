import React from 'react';
import { Editor, EditorState, Modifier, ContentBlock, ContentState, convertFromHTML, getDefaultKeyBinding, RichUtils, EditorProps } from 'draft-js';
import { Map } from 'immutable';
import { removeCurrentBlockText } from './EditorUtil';
import { SyntheticKeyboardEvent } from '../.';

export interface PluginEditorProps {
  editorState: EditorState
  onChange: (editorState: EditorState) => void
  editorRef: React.RefObject<Editor>
  readOnly?: boolean
}

const styleMap = {
  UNDERLINE: {
    textDecoration: 'underline'
  },
  STRKIETHROUGH: {
    textDecoration: 'line-through'
  },
  CODE: {
    border: '1px solid rgba(0, 0, 0, 0.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    fontSize: '0.75rem',
    paddingLeft: 4,
    paddingRight: 4,
    borderRadius: 4,
  }
}

function PluginEditor(props: PluginEditorProps | EditorProps) {
  const { editorState, onChange, readOnly } = props;

  const renderBlock = (contentBlock: ContentBlock) => {
    if (contentBlock.getType() === 'atomic') {
      console.log('atomic content type');
    }
  }

  const blockRenderMap = Map({
    'unstyled': {
      element: 'div'
    },
    'code-block': {
      element: 'code',
      wrapper: <pre spellCheck="false" />
    },
    'blockquote': {
      element: 'blockquote'
    },
    'ordered-list-item': {
      element: 'ol'
    },
    'unordered-list-item': {
      element: 'ul'
    }
  })

  const removeBlockFromBlockmap = (editorState: EditorState, key: string) => {
    const cs = editorState.getCurrentContent();
    const bm = cs.getBlockMap();
    const nbm = bm.remove(key);
    const ncs = cs.merge({
      blockMap: nbm
    }) as ContentState;

    let nes = null;
    if (ncs.getBlockMap().size < 1) {
      nes = EditorState.push(editorState, ContentState.createFromText(''), 'remove-range');
    } else {
      nes = EditorState.push(editorState, ncs, 'remove-range');
    }

    onChange(EditorState.moveFocusToEnd(nes));
  }

  const handleKeyBinding = (e: SyntheticKeyboardEvent) => {
    if (e.metaKey && e.key === 'z') {
      return 'editor-undo';
    }

    return getDefaultKeyBinding(e);
  }

  const handleKeyCommand = (command: string, editorState: EditorState) => {
    if (command === 'editor-save') {
      _clearEditorState(editorState);
      return 'handled';
    }

    if (command === 'editor-undo') {
      removeBlockFromBlockmap(editorState, editorState.getSelection().getAnchorKey());
      return 'handled';
    }

    const nes = RichUtils.handleKeyCommand(editorState, command);
    if (nes) {
      onChange(EditorState.moveFocusToEnd(nes));
      return 'handled';
    }

    return 'not-handled';
  }

  const handlePastedText = (text: string, html: string | undefined, editorState: EditorState) => {
    if (html) {
      const blocksFromHTML = convertFromHTML(html);
      const pastedBlocks = ContentState.createFromBlockArray(
        blocksFromHTML.contentBlocks,
        blocksFromHTML.entityMap,
      ).getBlockMap();

      const newState = Modifier.replaceWithFragment(
        editorState.getCurrentContent(),
        editorState.getSelection(),
        pastedBlocks
      );

      const newEditorState = EditorState.push(editorState, newState, 'insert-fragment');
      onChange(EditorState.moveFocusToEnd(newEditorState));

      return 'handled';
    }

    if (text) {
      const pastedBlocks = ContentState.createFromText(text).getBlockMap();
      const newState = Modifier.replaceWithFragment(
          editorState.getCurrentContent(),
          editorState.getSelection(),
          pastedBlocks,
      );

      const newEditorState = EditorState.push(editorState, newState, 'insert-fragment');
      onChange(EditorState.moveFocusToEnd(newEditorState));

      return 'handled';
    }

    return 'not-handled';
  }

  const handleBeforeInput = (chars: string, editorState: EditorState, _eventTimeStamp: number) => {
    if (chars === ' ' || chars === '`') {
      const selection = editorState.getSelection();
      const command = editorState
        .getCurrentContent()
        .getBlockForKey(selection.getStartKey())
        .getText();

      switch (command) {
        case '-':
          _smartKeyCommand('block', 'unordered-list-item', removeCurrentBlockText(editorState));
          return 'handled';
        case '>':
          _smartKeyCommand('block', 'blockquote', removeCurrentBlockText(editorState));
          return 'handled';
        case '``':
          _smartKeyCommand('block', 'code-block', removeCurrentBlockText(editorState));
          return 'handled';
        default:
          return 'not-handled';
      }
    }

    return 'not-handled';
  }

  const _smartKeyCommand = (type: 'block' | 'inline', style: string, editorState: EditorState) => {
    if (type === 'block') {
      onChange(EditorState.moveFocusToEnd(RichUtils.toggleBlockType(editorState, style)));
    } else {
      onChange(EditorState.moveFocusToEnd(RichUtils.toggleInlineStyle(editorState, style)));
    }
  }

  const _clearEditorState = (editorState: EditorState) => {
    const es = EditorState.push(editorState, ContentState.createFromText(''), 'remove-range');
    onChange(EditorState.moveFocusToEnd(es));
  }

  return (
    <Editor
      {...props}
      readOnly={readOnly}
      editorState={editorState}
      onChange={onChange}
      blockRendererFn={renderBlock}
      blockRenderMap={blockRenderMap}
      customStyleMap={styleMap}
      keyBindingFn={handleKeyBinding}
      handleKeyCommand={handleKeyCommand}
      handlePastedText={handlePastedText}
      handleBeforeInput={handleBeforeInput}
    />
  )

}

export default PluginEditor;