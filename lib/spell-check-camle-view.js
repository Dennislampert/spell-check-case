'use babel';

export default class SpellCheckCamleView {

  constructor(serializedState) {
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('spell-check-camle')
    this.message = document.createElement('div');
    this.message.classList.add('message');
    this.message.textContent = 'Looks good';
    this.element.appendChild(this.message);
  }

  // Create message element
  setMessage(misspelledWords, atom) {
    this.destroy();
    if (misspelledWords) {

      document.querySelectorAll(".line[data-screen-row]")
      .forEach(function (line) {
        misspelledWords.forEach((word) => {
          const newSpanTag = '<em style="border-bottom: 2px dotted #ff0000;">' + word.toString() + '</em>';
          if (line.innerHTML.indexOf(word) !== - 1 && line.innerHTML.indexOf(newSpanTag) === - 1) {
            splitLines = line.innerHTML.split(word);
            // line.innerHTML = splitLines.join(newSpanTag).toString();
          }
        });
      });
    }
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }
}
