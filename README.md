# Mango Editor

This is a Editor based on the `draft-js`

This editor is made for developers who wants to make slack-like text editor


## Usage

```bash
yarn add draft-js mango-plugins-editor
```
<h2>
  <a href="https://mango-editor-playground.vercel.app/" target="_blank">Demo</a>
</h2>

## Documentation

### mango-plugins-editor

### Editor

Available props. mango-plugins-editor can accept props which are provided by draft-js editor.

```javascript
export interface MangoEditorProps extends EditorProps {
  editorRef?: React.RefObject<Editor>;
  onFileUploadClick?: () => void;
  onExtraButtonClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onHandleKeyBinding?: (e: SyntheticKeyboardEvent) => string | null;
  onHandlePastedText?: (text: string, html: string | undefined, editorState: EditorState) => DraftHandleValue;
  onHandleKeyCommand?: (command: string, editorState: EditorState, eventTimeStamp: number) => DraftHandleValue;
  onHandleBeforeInput?: (chars: string, editorState: EditorState, eventTimeStamp: number) => DraftHandleValue;
}
```

## onFileUploadClick

Not implement yet.

## onExtraButtonClick

mango-plugin-editor displays extra button if you pass `onExtraButtonClick` props to mango-plugins-editor.

you can use optional `extra button` to control your own extran behavior.

## onHandleKeyBinding, onHandlePastedText, onHandleKeyCommand, onHandleBeforeInput

mango-plugin-editor executes default `keyBindingFn` of draft-js editor.

if you pass `onHandleKeyBinding` props to mango-plugin-editor, you can get control of `keyBindingFn` and you can process extra behavior and return values.


## Sample Code

```javascript
import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import MangoEditor, { SyntheticKeyboardEvent } from '../.'
import { ContentState, convertToRaw, convertFromRaw, EditorState, getDefaultKeyBinding, RichUtils, Editor } from 'draft-js';
import { Avatar, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, Paper } from '@material-ui/core';

const App = () => {
  const initialContent = EditorState.createEmpty()
  const editorRef = React.useRef<Editor>()
  const [messages, setMessages] = React.useState<string[]>([])
  const [editorState, setEditorState] = React.useState<EditorState>(initialContent)

  const handleReturn = (e: SyntheticKeyboardEvent, editorState: EditorState) => {
    if (!e.shiftKey) {
      handleSendMessage(editorState)
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

  const handleBeforeInput = (
    chars: string,
    editorState: EditorState,
    _eventTimeStamp: number
  ) => {
    if (chars === undefined) return 'handled'

    if (chars === '@' || chars === '#') {
      const selection = editorState.getSelection();
      const command = editorState
        .getCurrentContent()
        .getBlockForKey(selection.getStartKey())
        .getText();

      const index = command.lastIndexOf(' ');
      if (index + 1 === command.length) {
        setSuggestions(true)
      }
    }

    return 'not-handled'
  };

  const handleExtraButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    console.log('handleExtraButtonClick')
  }

  const handleClickSuggestion = (
    user: {
      id: number;
      name: string;
      avatar: string | undefined;
      online: boolean;
      email: string;
    }
  ) => {
    setSuggestions(false)
  }

  const targetUsers = users.filter(u => u.name.includes(search))

  return (
    <div className="markdown-body" style={{ overflow: 'auto' }}>
      {messages.map((message, index) => (
        <div key={index} style={{ padding: 10 }}>
          <MangoEditor
            editorState={EditorState.createWithContent(convertFromRaw(JSON.parse(message)))}
            readOnly={true}
            onChange={setEditorState}
          />
        </div>
      ))}
      {suggestions && (
      <List
        component="nav"
        aria-labelledby="suggestions"
      >
        {targetUsers.map(user => (
          <ListItem key={user.id} button onClick={() => handleClickSuggestion(user)}>
            <ListItemIcon>
              <Avatar src={user.avatar} />
            </ListItemIcon>
            <ListItemText primary={user.name} />
            <ListItemSecondaryAction>
              <Brightness1RoundedIcon color={user.online ? 'secondary' : 'disabled'} fontSize="small" />
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      )}
      <MangoEditor
        editorRef={editorRef}
        placeholder="Enter your messages (Shift + Enter for new line)"
        editorState={editorState}
        onChange={setEditorState}
        handleReturn={handleReturn}
        onExtraButtonClick={handleExtraButtonClick}
        onHandleBeforeInput={handleBeforeInput}
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
