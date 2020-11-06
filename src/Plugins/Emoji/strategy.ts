import { ContentBlock } from 'draft-js';
import findWithRegex from '../Utils/findWithRegex';

const colons = `:[a-zA-Z0-9-_+]+:`;
const skin = `:skin-tone-[2-6]:`;
const colonsRegex = new RegExp(`(${colons}${skin}|${colons})`, 'g');

export function emojiStrategy(contentBlock: ContentBlock, callback: Function) {
  findWithRegex(colonsRegex, contentBlock, callback)
}