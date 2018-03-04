'use babel';
/*jshint esversion: 6 */
import SpellCheckCamelView from './spell-check-case-view';
import StatusBarElement from './status-bar-element';
import { CompositeDisposable } from 'atom';

const spellchecker = require('spellchecker');

export default {
  spellCheckCamelView: null,
  modalPanel: null,
  subscriptions: null,
  activated: false,

  activate(state) {
    this.spellCheckCamelView = new SpellCheckCamelView(state.spellCheckCamelViewState);
    this.statusBarElement = new StatusBarElement();
    this.statusBarElement.updateCount(0);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.spellCheckCamelView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'spell-check-case:toggle': () => this.toggle(),
      'spell-check-case-add-word:addWord': () => this.addWord(),
      'core:save': () => this.triggerSpellcheck(),
    }));
  },
  consumeStatusBar(statusBar) {
    statusBar.addLeftTile({item: this.statusBarElement.getElement(), priority: 100});
  },
  addWord() {
    try {
      const word = atom.workspace.getActiveTextEditor().getSelections()[0].getText();
      if (word && typeof word === 'string') {
        spellchecker.add(word);
      }
    } catch (e) {
      // console.log('add word error', e);
      // die quiet
    }
  },

  deactivate() {
    // this.modalPanel.destroy();
    // this.subscriptions.dispose();
    this.spellCheckCamelView.removeMarkers();
    this.statusBarElement.removeElement();
    // this.spellCheckCamelView.destroy();
  },

  serialize() {
    return {
      spellCheckCamelViewState: this.spellCheckCamelView.serialize()
    };
  },

  toggle() {
    if (this.activated) {
      this.deactivate();
      this.activated = false;
    } else {
      this.activated = true;
      const me = this;
      this.triggerSpellcheck();
    }
  },

  triggerSpellcheck() {
    if (!this.activated) {
      return;
    }
    const me = this;
    try {
      const currentFileText = atom.workspace.getActivePaneItem().buffer.cachedText;
      if (!currentFileText) {
        return;
      }

      const camelWords = currentFileText.match(/[a-zA-Z]*/g);
      let missSpelled = [];
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
        this.statusBarElement.updateCount(missSpelled.length);
        this.spellCheckCamelView.setMessage(missSpelled, atom.workspace.getActiveTextEditor());
      } else {
        this.spellCheckCamelView.setMessage(missSpelled, atom.workspace.getActiveTextEditor());
        this.statusBarElement.updateCount(0);
      }
    } catch(r) {
      //console.log('Error', r);
      // die quiet
    }
  },

  showHide(e) {
    const me = this;
    if (e === 'show') {
      setTimeout(() => {
        me.showHide('hide');
      }, 350);
    }
    this.modalPanel[e]();
  }
};
