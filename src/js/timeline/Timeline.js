import timelineHTML from './timeline.html';

export default class Timeline {
  constructor(parentEl) {
    if (!parentEl) {
      throw Error('Элемент не найден');
    }
    this.parentEl = parentEl;
  }

  init() {
    this.parentEl.insertAdjacentHTML('afterbegin', timelineHTML);
    window.scrollTo(0, document.body.scrollHeight);
    this.videoEl = document.querySelector('video');
    this.videoEl.addEventListener('canplay', () => window.scrollTo(0, document.body.scrollHeight));
  }
}
