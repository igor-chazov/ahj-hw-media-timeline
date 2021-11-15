import postHTML from './post.html';

export default class Post {
  constructor({ type, content, coords } = {}) {
    this.element = null;
    this.els = {
      body: null,
      coords: null,
      date: null,
    };

    this.init(type, content, coords);
  }

  init(type, content, coords) {
    let tempWrapEl = document.createElement('div');
    tempWrapEl.insertAdjacentHTML('afterbegin', postHTML);

    this.element = tempWrapEl.querySelector('.post');
    tempWrapEl = null;

    this.els.body = this.element.querySelector('.post__body');
    this.els.coords = this.element.querySelector('.post__coords');
    this.els.date = this.element.querySelector('.post__date');
    this.setCoords(coords);
    this.setDate();

    const create = {
      text: Post.createTextPost,
      audio: Post.createAudioPost,
      video: Post.createVideoPost,
    };

    const postEl = create[type](content);
    this.els.body.prepend(postEl);
  }

  setCoords(coords) {
    if (coords && 'latitude' in coords) {
      this.els.coords.textContent = `[${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}]`;
      return;
    }

    this.els.coords.classList.add('hidden');
  }

  setDate() {
    const created = new Date();
    const date = created.toLocaleDateString('ru');
    const time = created.toLocaleTimeString('ru', { hour: 'numeric', minute: 'numeric' });
    this.els.date.textContent = `${date} ${time}`;
  }

  static createTextPost(content) {
    const postTextEl = document.createElement('p');
    postTextEl.classList.add('post__text');
    postTextEl.textContent = content;
    return postTextEl;
  }

  static createAudioPost(content) {
    const audioEl = document.createElement('div');
    audioEl.classList.add('post__audio');
    const postAudioEl = document.createElement('audio');
    postAudioEl.preload = 'metadata';
    postAudioEl.controls = true;
    postAudioEl.src = URL.createObjectURL(content);
    audioEl.append(postAudioEl);
    return audioEl;
  }

  static createVideoPost(content) {
    const videoEl = document.createElement('div');
    videoEl.classList.add('post__video');
    const postVideoEl = document.createElement('video');
    postVideoEl.preload = 'metadata';
    postVideoEl.controls = true;
    postVideoEl.src = URL.createObjectURL(content);
    videoEl.append(postVideoEl);
    return videoEl;
  }
}
