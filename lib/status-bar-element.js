'use babel';
/*jshint esversion: 6 */
module.exports = class StatusBarElement{
  constructor() {
    this.element = document.createElement('div');
    this.element.classList.add('spell-check-typo-case-status','inline-block');
  }

  updateCount(count) {
    const color = count && count > 0 ? '#F88303' : '#73c990';
    this.element.innerHTML = '<span style="color: '+ color +';" class="icon icon-pencil"></span>';
    this.element.classList.remove("spell-check-typo-case-hidden");
  }

  getElement() {
    return this.element;
  }

  removeElement() {
    this.element.classList.add("spell-check-typo-case-hidden");
  }
};
