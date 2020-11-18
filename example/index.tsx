import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import MangoEditor, { SyntheticKeyboardEvent } from '../.'
import { ContentState, convertToRaw, convertFromRaw, EditorState, getDefaultKeyBinding, RichUtils, Editor } from 'draft-js';
import { Avatar, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, Paper } from '@material-ui/core';

import Brightness1RoundedIcon from '@material-ui/icons/Brightness1Rounded'

const users = [
  {
    id: 1,
    name: 'dante',
    avatar: undefined,
    email: 'dante@stunitas.com',
    online: true
  },
  {
    id: 2,
    name: 'leeej',
    avatar: undefined,
    email: 'leeej@stunitas.com',
    online: false
  },
  {
    id: 3,
    name: 'wecanooo',
    avatar: undefined,
    email: 'wecanooo@stunitas.com',
    online: true
  },
  {
    id: 4,
    name: '장광우',
    avatar: undefined,
    email: 'indio74@stunitas.com',
    online: true
  },
  {
    id: 5,
    name: '정원준',
    avatar: undefined,
    email: 'joon@stunitas.com',
    online: true
  }
]

const App = () => {
  const initialContent = EditorState.createEmpty()
  const editorRef = React.useRef<Editor>()
  const [messages, setMessages] = React.useState<string[]>([])
  const [editorState, setEditorState] = React.useState<EditorState>(initialContent)
  const [suggestions, setSuggestions] = React.useState<boolean>(false)
  const [search, setSearch] = React.useState<string>('')

  React.useEffect(() => {
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [suggestions])

  const handleKeyUp = () => {
    if (!suggestions) return

    const selection = window.getSelection();
    if (!selection) return

    const range = selection.getRangeAt(0);
    let text = range.startContainer.textContent

    if (!text) return
    text = text.substring(0, range.startOffset);

    const index = text.lastIndexOf('@')
    const search = text.substring(index + 1)

    setSearch(search)
  }

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
