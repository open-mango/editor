import { ContentBlock } from 'draft-js';
import findWithRegex from '../Utils/findWithRegex';

const HASHTAG_REGEX = /#[\w\u0590-\u05ff\u3131-\u318E\uAC00-\uD7A3]+/g;

export function hashtagStrategy(contentBlock: ContentBlock, callback: Function) {
  findWithRegex(HASHTAG_REGEX, contentBlock, callback);
}
