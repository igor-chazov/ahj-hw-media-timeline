import Modal from './Modal';

export default class ModalTimeline extends Modal {
  constructor({ html, params }) {
    super({ html });
    this.params = params;
  }

  hide() {
    super.hide();
    if (!this.params) return;

    if ('timelineInputEl' in this.params) {
      this.params.timelineInputEl.focus();
      this.params.timelineInputEl.value = '';
    }
  }
}
