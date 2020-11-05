/**
 * Editor Util
 * https://github.com/jpuri/draftjs-utils 를 참고하여 typescript 로 변환함
 * clearEditorContent 를 사용하기 위해서 만들었는데
 * 자체적으로 만든 _clearEditorState 가 더 좋은 것 같아서 지금은 사용하지 않음
 * 하지만, 분석용으로 괜찮을 것 같아서 소스에서 제거하지는 않음
 */

import {
  EditorState,
  RichUtils,
  Modifier,
  SelectionState,
} from 'draft-js'

export function getSelectedBlockMap(editorState: EditorState) {
  const selectionState = editorState.getSelection()
  const contentState = editorState.getCurrentContent()
  const startKey = selectionState.getStartKey()
  const endKey = selectionState.getEndKey()
  const blockMap = contentState.getBlockMap()

  return blockMap
    .toSeq()
    .skipUntil((_, k) => k === startKey)
    .takeUntil((_, k) => k === endKey)
    .concat([[endKey, blockMap.get(endKey)]])
}

/**
 * 선택된 블록의 리스트를 리턴합니다.
 * @param editorState
 * @returns List<ContentBlock>
 */
export function getSelectedBlocksList(editorState: EditorState) {
  return getSelectedBlockMap(editorState).toList()
}

/**
 * 선택된 블록을 리턴합니다. 선택된 블럭이 없다면 undefined 가 리턴됩니다.
 * @param editorState
 * @returns ContentBlock | undefined
 */
export function getSelectedBlock(editorState: EditorState) {
  if (editorState) return getSelectedBlocksList(editorState).get(0)
  return undefined
}

/**
 * 선택된 블록의 바로 전 블록을 리턴합니다. 바로 전 블록이 없다면 undefined 가 리턴됩니다.
 * @param editorState
 * @returns number | undefined
 */
export function getBlockBeforeSelectedBlock(editorState: EditorState) {
  if (editorState) {
    const selectedBlock = getSelectedBlock(editorState)
    const contentState = editorState.getCurrentContent()
    const blockList = contentState
      .getBlockMap()
      .toSeq()
      .toList()
    let previousIndex = 0

    blockList.forEach((block, index) => {
      if (block?.get('key') === selectedBlock?.get('key')) {
        previousIndex = index || 0 - 1
      }
    })

    if (previousIndex > -1) {
      return blockList.get(previousIndex)
    }
  }

  return undefined
}

/**
 * 모든 컨텐츠 블록을 리스트로 반환합니다.
 * @param editorState
 * @returns List<ContentBlock>
 */
export function getAllBlocks(editorState: EditorState) {
  return editorState
    .getCurrentContent()
    .getBlockMap()
    .toList()
}

/**
 * 선택된 컨텐츠 블록의 타입을 반환합니다. 블록이 없거나 일치하는 타입이 없다면 undefined 가 리턴됩니다.
 * @param editorState
 * @returns string
 */
export function getSelectedBlocksType(editorState: EditorState) {
  const blocks = getSelectedBlocksList(editorState)
  const hasMultipleBlockTypes = blocks.some(
    block => block?.getType() !== blocks.get(0).getType()
  )

  if (!hasMultipleBlockTypes) {
    return blocks.get(0).getType()
  }

  return undefined
}

/**
 * 선택된 블럭의 블럭 스타일을 제거합니다.
 * 제거할 블록타입이 있다면 제거된 후의 새로운 editorState 가 리턴이 되고,
 * 그렇지 않다면 인자로 넘어온 editorState 를 리턴합니다.
 * @param editorState
 * @returns EditorState
 */
export function removeSelectedBlocksStyle(editorState: EditorState) {
  const newContentState = RichUtils.tryToRemoveBlockStyle(editorState)
  if (newContentState) {
    return EditorState.push(editorState, newContentState, 'change-block-type')
  }

  return editorState
}

/**
 * 선택된 컨텐츠 블럭의 텍스트를 반환합니다.
 * @param editorState
 * @returns string
 */
export function getSelectionText(editorState: EditorState) {
  let selectedText = ''
  const currentSelection = editorState.getSelection()
  let start = currentSelection.getAnchorOffset()
  let end = currentSelection.getFocusOffset()
  const selectedBlocks = getSelectedBlocksList(editorState)
  if (selectedBlocks.size > 0) {
    if (currentSelection.getIsBackward()) {
      const temp = start
      start = end
      end = temp
    }

    for (let i = 0; i < selectedBlocks.size; i += 1) {
      const blockStart = i === 0 ? start : 0
      const blockEnd =
        i === selectedBlocks.size - 1
          ? end
          : selectedBlocks.get(i).getText().length
      selectedText += selectedBlocks
        .get(i)
        .getText()
        .slice(blockStart, blockEnd)
    }
  }

  return selectedText
}

export function addLineBreakRemovingSelection(editorState: EditorState) {
  const content = editorState.getCurrentContent()
  const selection = editorState.getSelection()
  let newContent = Modifier.removeRange(content, selection, 'forward')
  const fragment = newContent.getSelectionAfter()
  const block = newContent.getBlockForKey(fragment.getStartKey())
  newContent = Modifier.insertText(
    newContent,
    fragment,
    '\n',
    block.getInlineStyleAt(fragment.getStartOffset()),
    undefined
  )

  return EditorState.push(editorState, newContent, 'insert-fragment')
}

/**
 * 새로운 블럭 (unstyled) 를 추가합니다.
 * @param editorState
 */
export function insertNewUnstyledBlock(editorState: EditorState) {
  const newContentState = Modifier.splitBlock(
    editorState.getCurrentContent(),
    editorState.getSelection()
  )

  const newEditorState = EditorState.push(
    editorState,
    newContentState,
    'split-block'
  )

  return removeSelectedBlocksStyle(newEditorState)
}

/**
 * editorState 를 clear 합니다.
 * @param editorState
 */
export function clearEditorContent(editorState: EditorState) {
  const blocks = editorState
    .getCurrentContent()
    .getBlockMap()
    .toList()

  const updatedSelection = editorState.getSelection().merge({
    anchorKey: blocks.first().get('key'),
    anchorOffset: 0,
    focusKey: blocks.last().get('key'),
    focusOffset: blocks.last().getLength(),
  })

  const newContentState = Modifier.removeRange(
    editorState.getCurrentContent(),
    updatedSelection,
    'forward'
  )

  return EditorState.push(editorState, newContentState, 'remove-range')
}

export function removeCurrentBlockText(editorState: EditorState) {
  const selection = editorState.getSelection()
  const anchorKey = selection.getAnchorKey()
  const contentState = editorState.getCurrentContent()

  const startOffset = 0
  const endOffset = selection.getEndOffset()

  const newSelection = new SelectionState({
    anchorKey: anchorKey,
    anchorOffset: startOffset,
    focusKey: anchorKey,
    focusOffset: endOffset
  })

  const afterRemovalContentState = Modifier.removeRange(
    contentState,
    newSelection,
    'backward'
  )

  return EditorState.push(editorState, afterRemovalContentState, 'remove-range')
}