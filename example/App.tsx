import * as React from 'react';
import MangoEditor, { SyntheticKeyboardEvent, UploadFile } from '../.'
import { convertToRaw, convertFromRaw, EditorState, Editor } from 'draft-js';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

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

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
    }
  })
)

const App = () => {
  const classes = useStyles()
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

  function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  return (
    <div className="markdown-body" style={{ display: 'flex', flexDirection: 'column' }}>
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
