'use babel';
/*jshint esversion: 6 */
import { Emitter } from 'atom';
export default class SpellCheckCamelView {

  constructor(serializedState) {
    // Create root element
    this.emitter = new Emitter();
    this.markerLayers = [];
    this.element = document.createElement('div');
    this.element.classList.add('spell-checker');
    this.message = document.createElement('div');
    this.message.classList.add('message');
    this.message.textContent = '';
    this.message.innerHTML += '<span style="color: #F88303;" >_____________ <span><span style="color: #F88303;" class="icon icon-pencil"></span>';
    this.element.appendChild(this.message);
  }

  onDidAddMarker(callback) {
    this.emitter.on('did-add-marker', callback);
  }
  // Create message element
  setMessage(misspelledWords, editor) {
    this.removeMarkers();
    const me = this;
    if (misspelledWords && misspelledWords.length) {
      markerLayer = editor.addMarkerLayer();
      this.markerLayers.push(markerLayer);
      misspelledWords.forEach((word) => {
        const cmd = word[0] === word[0].toUpperCase() ? word+'(?!=*[a-z])': '\\b'+word+'(?!=*[a-z])';
        const regExp = new RegExp(cmd, 'g');
        editor.scanInBufferRange(regExp, [[0, 0], editor.getEofBufferPosition()], function (result) {

          marker = markerLayer.markBufferRange(result.range);
          me.emitter.emit('did-add-marker', marker);
        });
        editor.decorateMarkerLayer(markerLayer, {
          type: 'highlight',
          class: me.classBaker(),
        });
      });
    }
  }

  removeMarkers() {
    if (this.markerLayers.length) {
      this.markerLayers.forEach((markerLayer) => {
        markerLayer.destroy();
      });
      this.markerLayers = [];
    }
  }

  classBaker() {
    return 'spell-check-typo-case';
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
