'use babel';
/*jshint esversion: 6 */
import SpellCheckCamelView from './spell-check-camel-view';
import { CompositeDisposable } from 'atom';

const spellchecker = require('spellchecker');

export default {
  spellCheckCamelView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.spellCheckCamelView = new SpellCheckCamelView(state.spellCheckCamelViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.spellCheckCamelView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'spell-check-camel:toggle': () => this.toggle(),
      'core:save': () => this.toggle(),
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.spellCheckCamelView.destroy();
  },

  serialize() {
    return {
      spellCheckCamelViewState: this.spellCheckCamelView.serialize()
    };
  },

  toggle() {
    this.showHide('show');
    setTimeout(function(){
      me.showHide('hide');
    }, 200);
    const currentFileText = atom.workspace.getActivePaneItem().buffer.cachedText;
    if (!currentFileText) {
      return;
    }

    const camelWords = currentFileText.match(/[a-zA-Z]*/g);
    let missSpelled = [];
    const me = this;
    if (camelWords && camelWords.length) {
      missSpelled = camelWords.reduce((acc, camelWord) => {
        const splitTypos = camelWord.replace(/([a-z](?=[A-Z]))/g, '$1 ').split(' ');
        const words = splitTypos.length && splitTypos[0] ? splitTypos : [];
        if (words.length) {
          const typos = words.filter((word) =>
            (word && acc.indexOf(word) === -1 && spellchecker.isMisspelled(word)));
          acc = [ ...acc, ...typos];
          return acc;
        } else {
          return acc;
        }
      }, []);
    }
    if (missSpelled.length) {
      this.spellCheckCamelView.setMessage(missSpelled, atom.workspace.getActiveTextEditor());
    }
  },

  showHide(e) {
    this.modalPanel[e]();
  }
};
