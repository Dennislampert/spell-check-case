'use babel';

import SpellCheckCamelView from './spell-check-camel-view';
import { CompositeDisposable } from 'atom';

const spellchecker = require('spellchecker');

export default {
  spellCheckCamelView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.spellCheckCamelView = new SpellCheckCamelView(state.spellCheckCamelViewState);
    // this.modalPanel = atom.workspace.addModalPanel({
    //   item: this.spellCheckCamelView.getElement(),
    //   visible: false
    // });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'spell-check-camel:toggle': () => this.toggle(),
      'core:save': () => this.toggle(),
    }));
  },

  deactivate() {
    // this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.spellCheckCamelView.destroy();
  },

  serialize() {
    return {
      spellCheckCamelViewState: this.spellCheckCamelView.serialize()
    };
  },

  toggle() {
    const currentFileText = atom.workspace.getActivePaneItem().buffer.cachedText;

    const camelWords = currentFileText.match(/[a-zA-Z]*/g);
    missSpelled = [];
    camelWords.forEach((camelWord) => {
      if (camelWords.length) {
        words = camelWord.replace(/([a-z](?=[A-Z]))/g, '$1 ').split(' ');
        words = words.length && words[0] ? words : [];
         if (words.length) {
          words.forEach((word) => {
            if (word) {
              if (spellchecker.isMisspelled(word) &&
                missSpelled.indexOf(word) === -1
              ) {
                missSpelled.push(word);
              }
            }
          });
        }
      }
    });
    this.spellCheckCamelView.setMessage(missSpelled, atom.workspace.getActiveTextEditor());
    // return this.modalPanel.hide();
  //   (
  //     this.modalPanel.isVisible() ?
  //     this.modalPanel.hide() :
  //     this.modalPanel.show()
  // );
  }

};
