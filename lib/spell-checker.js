'use babel';
/*jshint esversion: 6 */
import SpellCheckCamelView from './spell-checker-view';
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

    // load dictionary & known word list for unix systems.
    this.loadDictionary(true)
    this.loadKnownWords()

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'spell-checker:toggle': () => this.toggle(),
      'spell-checker-add-word:addWord': () => {this.addWord(); this.triggerSpellcheck()},
      'core:save': () => this.triggerSpellcheck(),
    }));

    // watch for configuration change
    this.subscriptions.add(atom.config.onDidChange("spell-checker.knownWords", (e) => {
      e.oldValue.forEach((w) => {spellchecker.remove(w)})
      e.newValue.forEach((w) => {spellchecker.add(w)})
    }))
    this.subscriptions.add(atom.config.onDidChange("spell-checker.locale", (e) => {
      this.loadDictionary(false)
      this.loadKnownWords()
    }))
  },
  // load spellcheck dictionary for unix systems.
  loadDictionary (bWarn) {
    // windows has its own thing, so if windows skip
    if (process.platform != 'win32') {
      var sPath = []

      if (process.platform == 'linux') {
        // paths ripped from, atom spell-check
        sPath = sPath.concat([
          '/usr/share/hunspell',
          '/usr/share/myspell',
          '/usr/share/myspell/dicts'
        ])
      }
      if (process.platform == 'darwin') {
        // paths ripped from, atom spell-check
        sPath = sPath.concat([
          '/',
          '/System/Library/Spelling'
        ])
      }

      for (var i = 0; i < sPath.length; i++) {
        if (spellchecker.setDictionary(this.getLocale(), sPath[i])) {
          return
        }
      }

      // if we are here we failed to load a dictionary
      if (bWarn) {
        var msg = "Could not locate dictionary for locale: " + this.getLocale() +
          " searched path: \n" + sPath
        atom.notifications.addWarning(msg)
      }
    }
  },
  // load known word list on unix systems
  loadKnownWords () {
    // skip if windows, it does its own thing.
    if (process.platform != 'win32') {
      var kWords = atom.config.get('spell-checker.knownWords')
      if (kWords !== undefined) {
        kWords.forEach((word) => {
          spellchecker.add(word)
        })
      }
    }
  },

  // get locale string. Ex 'en-US'
  getLocale () {
    var locale = atom.config.get('spell-checker.locale')
    if (locale === undefined || locale === "") {
      return navigator.language
    } else {
      return locale
    }
  },
  consumeStatusBar(statusBar) {
    statusBar.addLeftTile({item: this.statusBarElement.getElement(), priority: 100});
  },
  addWord() {
    try {
      const word = atom.workspace.getActiveTextEditor().getSelections()[0].getText();
      if (word && typeof word === 'string') {
        spellchecker.add(word);
        this.saveWord(word)
      }
    } catch (e) {
      // console.log('add word error', e);
      // die quiet
    }
  },
  // save word to the known word list
  saveWord (word) {
    var kWords = atom.config.get('spell-checker.knownWords')
    if (kWords !== undefined) {
      kWords.push(word)
      atom.config.set('spell-checker.knownWords', kWords)
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
