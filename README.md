# Mango Editor

This is a Editor based on the `draft-js`

This editor is made for developers who wants to make slack-like text editor

## Usage

```bash
yarn add draft-js mango-plugins-editor
```

## Sample Code

```javascript
import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import MangoEditor, { SyntheticKeyboardEvent } from '../.'
import { ContentState, convertToRaw, convertFromRaw, EditorState } from 'draft-js';

const App = () => {
  const initialContent = EditorState.createEmpty()
  const [messages, setMessages] = React.useState<string[]>([])
  const [editorState, setEditorState] = React.useState<EditorState>(initialContent)

  const handleReturn = (e: SyntheticKeyboardEvent, editorState: EditorState) => {
    if (!e.shiftKey) {
      handleSendMessage(editorState)
      return 'handled'
    }

    if (e.key === 'handle') {
      return 'handled'
    }

    return 'not-handled'
  }

  const handleSendMessage = (editorState: EditorState) => {
    const content = editorState.getCurrentContent()
    if (content.getPlainText('').length < 1) return 'not-handled'

    const message = JSON.stringify(convertToRaw(editorState.getCurrentContent()))
    setMessages(prev => [...prev, message])

    setTimeout(() => {
      _clearEditorState(editorState)
    }, 10)
  }

  const _clearEditorState = (editorState: EditorState) => {
    const es = EditorState.push(editorState, ContentState.createFromText(''), 'remove-range')
    setEditorState(EditorState.moveFocusToEnd(es))
  }

  return (
    <div className="markdown-body" style={{ overflow: 'auto' }}>
      {messages.map((message, index) => (
        <div style={{ padding: 10 }}>
          <MangoEditor
            editorState={EditorState.createWithContent(convertFromRaw(JSON.parse(message)))}
            readOnly={true}
            onChange={setEditorState}
          />
        </div>
      ))}
      <MangoEditor
        placeholder="Enter your messages (Shift + Enter for new line)"
        editorState={editorState}
        onChange={setEditorState}
        handleReturn={handleReturn}
      />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
```

## TODO

- [x] Hashtag Plugin
- [x] Add Emoji-Mart
- [ ] File Upload & Previews with react-dropzone
- [ ] Mention Plugin
