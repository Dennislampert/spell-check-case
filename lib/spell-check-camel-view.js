'use babel';
import { Emitter } from 'atom';
export default class SpellCheckCamelView {

  constructor(serializedState) {
    // Create root element
    this.emitter = new Emitter();
    this.markerLayers = [];
    // this.element = document.createElement('div');
    // this.element.classList.add('spell-check-camel')
    // this.message = document.createElement('div');
    // this.message.classList.add('message');
    // this.message.textContent = 'Looks good';
    // this.element.appendChild(this.message);
  }

  onDidAddMarker(callback) {
    this.emitter.on('did-add-marker', callback);
  }
  // Create message element
  setMessage(misspelledWords, editor) {
    this.removeMarkers();
    me = this;
    results = [];
    if (misspelledWords) {
      markerLayer = editor.addMarkerLayer();
      this.markerLayers.push(markerLayer);
      misspelledWords.forEach((word) => {
        editor.scanInBufferRange(new RegExp(word, 'g'), [[0, 0], editor.getEofBufferPosition()], function (result) {
          marker = markerLayer.markBufferRange(result.range);
          me.emitter.emit('did-add-marker', marker);
        });
        editor.decorateMarkerLayer(markerLayer, {
          type: 'highlight',
          class: me.classBaker()
        })
      });
    }
  }

  removeMarkers() {
    if (this.markerLayers.length) {
      this.markerLayers.forEach((markerLayer) => {
        markerLayer.destroy();
      })
      this.markerLayers = [];
    }
  }

  classBaker() {
    return className = 'highlight-selected';
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
