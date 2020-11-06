import { ContentBlock, ContentState } from 'draft-js';

const HANDLE_REGEX = /@[\w]+/g;
const HASHTAG_REGEX = /#[\w\u0590-\u05ff\u3131-\u318E\uAC00-\uD7A3]+/g;

export function handleStrategy(contentBlock: ContentBlock, callback: Function, _contentState: ContentState) {
  findWithRegex(HANDLE_REGEX, contentBlock, callback);
}

export function hashtagStrategy(contentBlock: ContentBlock, callback: Function, _contentState: ContentState) {
  findWithRegex(HASHTAG_REGEX, contentBlock, callback);
}

function findWithRegex(regex: RegExp, contentBlock: ContentBlock, callback: Function) {
  const text = contentBlock.getText();
  let matchArr, start;
  while ((matchArr = regex.exec(text)) !== null) {
    start = matchArr.index;
    callback(start, start + matchArr[0].length);
  }
}