import { ContentBlock } from 'draft-js';

const findWithRegex = (
  regex: RegExp,
  contentBlock: ContentBlock,
  callback: Function
): void => {
  const text = contentBlock.getText();
  let matchArr;
  let start;

  while ((matchArr = regex.exec(text)) !== null) {
    if (matchArr.index === regex.lastIndex) regex.lastIndex++;
    start = matchArr.index;
    callback(start, start + matchArr[0].length);
  }
};

export default findWithRegex;
