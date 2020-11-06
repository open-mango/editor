import type { ContentBlock } from 'draft-js'

const findWithRegex = (regex: RegExp, contentBlock: ContentBlock, callback: Function): void => {
  console.log('============ findWithRegex ENTRY')
  console.log(regex)

  const text = contentBlock.getText();
  let matchArr;
  let start;

  while ((matchArr = regex.exec(text)) !== null) {
    console.log('match regex', text)
    if (matchArr.index === regex.lastIndex) regex.lastIndex++;
    start = matchArr.index;
    callback(start, start + matchArr[0].length);
  }

  console.log('============ findWithRegex EXIT')
};

export default findWithRegex;