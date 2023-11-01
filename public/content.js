function getHighlightedText() {
  let text = "";

  if (window.getSelection) {
    // Get the selected text
    let selection = window.getSelection();
    if(selection == undefined) return "" 
    if (selection.rangeCount > 0) {
      // Get the first range in the selection
      let range = selection.getRangeAt(0);

      // Get the text within the range
      text = range.toString();
    }
  }

  return text;
}
function getFirstWordOfHighlightedText() {
  const highlightedText = getHighlightedText();

  if (highlightedText) {
    // Split the text by spaces to get words
    const words = highlightedText.trim().split(/\s+/);
    // Return the first word
    return words[0];
  } else {
    return "No highlighted text found.";
  }
}

chrome.runtime.sendMessage({word: getFirstWordOfHighlightedText()})

