import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import MangoEditor, { SyntheticKeyboardEvent } from '../.'
import { EditorState } from 'draft-js';

const App = () => {
  const editor = React.useRef<typeof MangoEditor>()
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
      <MangoEditor
        editorRef={editor}
        placeholder="아리랑"
        editorState={editorState}
        onChange={setEditorState}
        handleReturn={handleReturn}
      />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
