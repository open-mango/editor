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
```

## editorMode

You can change editor mode passing `editorMode` props.

Set editorMode to `chat`, if you want to use `mango editor` to slack-like editor

If you want to use `mango editor` to document editor, you can change mode `editor` to set editorMode

## mentions

When you need mention functionality especially using mango editor to `chat mode`, you can pass `mentions` props to `mango editor`

mentions example:

```javascript
const users = [
  {
    id: 1,
    name: 'John Malkovichi',
    avatar: undefined,
    email: 'john@gmail.com',
    online: true
  },
  {
    id: 2,
    name: 'Tom Hanks',
    avatar: undefined,
    email: 'tom@gmail.com',
    online: false
  },
  {
    id: 3,
    name: 'Scarlett Johansson',
    avatar: undefined,
    email: 'scarlett@gmail.com',
    online: true
  },
  {
    id: 4,
    name: '홍길동',
    avatar: undefined,
    email: 'hong@gmail.com',
    online: true
  },
  {
    id: 5,
    name: '김철수',
    avatar: undefined,
    email: 'john@gmail.com',
    online: true
  }
]
```

## onHandleMentionClick

We use mention trigger prefix string to '@'.

You can see mention suggestion list when you key press @ in mango editor area, if you pass `mentions` props to mango editor

Mango Editor fire `onHandleMentionClick` event with `Mention` interface when you click one of mention.

## onDragDropFiles

Multi file upload functionality included Mango Editor 0.3.2 version.

You can Drag &amp; Drop files to editor area or click file upload button on mango editor toolbar.

When you drop files to editor area then you can see preview panel over mango editor area and call `onDragDropFiles` callback function.

Make sure upload files to your server upload logic, and then return response to mango editor

## onExtraButtonClick

mango-plugin-editor displays extra button if you pass `onExtraButtonClick` props to mango-plugins-editor.

you can use optional `extra button` to control your own extran behavior.

## onHandleKeyBinding, onHandlePastedText, onHandleKeyCommand, onHandleBeforeInput

mango-plugin-editor executes default `keyBindingFn` of draft-js editor.

if you pass `onHandleKeyBinding` props to mango-plugin-editor, you can get control of `keyBindingFn` and you can process extra behavior and return values.

## Sample Code

```javascript
import * as React from 'react';
import MangoEditor, { SyntheticKeyboardEvent, UploadFile } from '../.'
import { convertToRaw, convertFromRaw, EditorState, Editor } from 'draft-js';

const users = [
  {
    id: 1,
    name: 'John Malkovichi',
    avatar: undefined,
    email: 'john@gmail.com',
    online: true
  },
  {
    id: 2,
    name: 'Tom Hanks',
    avatar: undefined,
    email: 'tom@gmail.com',
    online: false
  },
  {
    id: 3,
    name: 'Scarlett Johansson',
    avatar: undefined,
    email: 'scarlett@gmail.com',
    online: true
  },
  {
    id: 4,
    name: '홍길동',
    avatar: undefined,
    email: 'hong@gmail.com',
    online: true
  },
  {
    id: 5,
    name: '김철수',
    avatar: undefined,
    email: 'john@gmail.com',
    online: true
  }
]

const App = () => {
  const initialContent = EditorState.createEmpty()
  const editorRef = React.useRef<Editor>()
  const [messages, setMessages] = React.useState<string[]>([])
  const [editorState, setEditorState] = React.useState<EditorState>(initialContent)
  const [editorMode, setEditorMode] = React.useState<'chat' | 'editor'>('chat')

  const handleReturn = (e: SyntheticKeyboardEvent, editorState: EditorState) => {
    if (editorMode === 'chat' && !e.shiftKey) {
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
  }

  const handleExtraButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setEditorMode(prev => prev === 'chat' ? 'editor' : 'chat')
  }

  const handleDragDropFiles = (acceptedFiles: UploadFile[]) => {
    acceptedFiles.map(file => {
      file.uploaded = true
    })

    return acceptedFiles
  }

  return (
    <div
      className="markdown-body"
      style={{
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {messages.map((message, index) => (
        <div key={index}>
          <MangoEditor
            editorMode={editorMode}
            editorState={EditorState.createWithContent(convertFromRaw(JSON.parse(message)))}
            readOnly={true}
            onChange={setEditorState}
          />
        </div>
      ))}
      <MangoEditor
        editorMode={editorMode}
        editorRef={editorRef}
        mentions={users}
        editorState={editorState}
        onChange={setEditorState}
        onHandleReturn={handleReturn}
        onExtraButtonClick={handleExtraButtonClick}
        onDragDropFiles={handleDragDropFiles}
      />
    </div>
  );
};

export default App
```

See example [source](https://github.com/open-mango/editor/tree/master/example)

## TODO

- [x] Hashtag Plugin
- [x] Add Emoji-Mart
- [x] File Upload & Previews with react-dropzone
- [x] Mention Plugin