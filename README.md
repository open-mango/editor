# Mango Plugins Editor

This is a Plugin Editor for the `draft-js`

This package is for providing typescript and react hook version of `draft-js-plugins-editor`, also fixing bugs of `draft-js`, especially korean IME problems.

## Usage

```bash
yarn add draft-js mango-plugins-editor
```

```javascript
import 'react-app-polyfill/ie11'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import Editor from 'mango-plugins-editor'
import { EditorState } from 'draft-js'

const App = () => {
  const editorRef = React.useRef()
  const initialContent = EditorState.createEmpty()
  const [editorState, setEditorState] = React.useState<EditorState>(initialContent)

  return (
    <div>
      <Editor
        editorRef={editorRef}
        placeholder="Enter your messages"
        editorState={editorState}
        onChange={setEditorState}
      />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
```

## TODO

- [ ] Emoji Plugin
- [ ] Mention Plugin
- [ ] File Upload Plugin
- [ ] Sticker Plugin