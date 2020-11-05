import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Editor, { SyntheticKeyboardEvent } from '../.'
import { EditorState } from 'draft-js';

const App = () => {
  const editorRef = React.useRef()
  const initialContent = EditorState.createEmpty()
  const [editorState, setEditorState] = React.useState<EditorState>(initialContent)

  const handleReturn = (e: SyntheticKeyboardEvent, editorState: EditorState) => {
    if (!e.shiftKey) {
      return 'handled'
    }

    if (e.key === 'handle') {
      return 'handled'
    }

    return 'not-handled'
  }

  return (
    <div>
      <Editor
        editorRef={editorRef}
        placeholder="아리랑"
        editorState={editorState}
        onChange={setEditorState}
        handleReturn={handleReturn}
      />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
