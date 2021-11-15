import Post from './post/Post';
import ModalCoords from './modal/coords/ModalCoords';
import ModalInfo from './modal/info/ModalInfo';
import Animate from './Utils/Animate';

export default class TimelineController {
  constructor(parentEl) {
    if (!parentEl) {
      throw Error('Элемент не найден');
    }
    this.element = parentEl;
    this.els = {
      body: null,
      input: null,
      mediaDuration: null,
      userPanelVideoWrap: null,
      userPanelVideo: null,
      forms: {
        text: null,
        media: null,
      },
      mediaStart: null,
      mediaStop: null,
      btns: {
        audio: null,
        video: null,
        send: null,
        cancel: null,
      },
    };

    this.modals = {
      coords: null,
      info: null,
    };

    this.postType = null;
    this.recorder = null;
    this.isRecordStopped = true;
    this.mediaStopBtn = null;
  }

  init() {
    this.els.body = this.element.querySelector('.timeline__body');

    this.els.forms.text = this.element.querySelector('.user-panel__form-text');
    this.els.forms.text.addEventListener('submit', this.onFormTextSubmit.bind(this));

    this.els.input = this.element.querySelector('.user-panel__input');
    this.els.input.addEventListener('keydown', this.onInputKeypress.bind(this));
    this.els.input.focus();

    this.els.forms.media = this.element.querySelector('.form-media');
    this.els.forms.media.addEventListener('submit', this.onFormMediaSubmit.bind(this));

    this.els.mediaDuration = this.element.querySelector('.form-media__duration');

    this.els.mediaStart = this.element.querySelector('.form-media__start');
    this.els.mediaStop = this.element.querySelector('.form-media__stop');

    this.els.btns.audio = this.element.querySelector('.form-media__btn-audio');
    this.els.btns.audio.addEventListener('click', this.onBtnAudioClick.bind(this));

    this.els.btns.video = this.element.querySelector('.form-media__btn-video');
    this.els.btns.video.addEventListener('click', this.onBtnVideoClick.bind(this));

    this.els.btns.send = this.element.querySelector('.form-media__btn-send');
    this.els.btns.send.addEventListener('click', this.onBtnSendClick.bind(this));

    this.els.btns.cancel = this.element.querySelector('.form-media__btn-cancel');
    this.els.btns.cancel.addEventListener('click', this.onBtnCancelClick.bind(this));

    this.els.userPanelVideoWrap = this.element.querySelector('.user-panel__video-wrap');
    this.els.userPanelVideo = this.element.querySelector('.user-panel__video');

    this.modals.coords = new ModalCoords({ params: { timelineInputEl: this.els.input } });
    this.modals.info = new ModalInfo({ params: { timelineInputEl: this.els.input } });
  }

  // eslint-disable-next-line class-methods-use-this
  async getCoordsAuto() {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            success: true,
            coords: position.coords,
          });
        },
        (error) => {
          resolve({
            success: false,
            errCode: error,
          });
        },
      );
    });
  }

  async getCoordsManual(errCode) {
    const modalTexts = {
      0: 'К сожалению, ваш браузер не поддерживает определение место положения, пожалуйста, воспользуйтесь другим браузером, либо введите координаты вручную.',
      1: 'К сожалению, нам не удалось определить ваше место положение, пожалуйста, дайте разрешение на использование геолокации, либо введите координаты вручную.',
      2: 'К сожалению, нам не удалось определить ваше место положение, пожалуйста, проверьте ваше интернет соединение, либо введите координаты вручную.',
      3: null,
    };

    modalTexts['3'] = modalTexts['2'];

    let modalText = 'К сожалению, нам не удалось определить ваше место положение, пожалуйста, дайте разрешение на использование геолокации, либо введите координаты вручную.';

    if (errCode in modalTexts) modalText = modalTexts[errCode];

    this.modals.coords.show(modalText);
    const result = await this.modals.coords.getData();
    this.modals.coords.hide();
    return result;
  }

  async getCoords() {
    let result = {
      errCode: {
        code: 0,
      },
    };

    if (navigator.geolocation) {
      result = await this.getCoordsAuto();
      if (result.success) return result;
    }

    result = await this.getCoordsManual(result.errCode.code);
    return result;
  }

  async createPost({ type, content }) {
    const result = await this.getCoords();

    if (!result.success && !result.publishWithoutCoords) return;

    const postData = {
      type,
      content,
      coords: null,
    };

    if (result.success) postData.coords = result.coords;

    const post = new Post(postData);
    this.els.body.append(post.element);

    if (type === 'video') {
      this.videoEl = post.element.querySelector('video');
      this.videoEl.addEventListener('canplay', () => window.scrollTo(0, document.body.scrollHeight));
    } else {
      window.scrollTo(0, document.body.scrollHeight);
    }

    Animate.animationOpacity(post.element, 300);

    if (type === 'text') this.els.input.value = '';
  }

  // eslint-disable-next-line class-methods-use-this
  async onFormTextSubmit(event) {
    event.preventDefault();
  }

  async onInputKeypress(event) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    if (this.els.input.value === '') return;
    this.createPost({ type: 'text', content: this.els.input.value });
  }

  // eslint-disable-next-line class-methods-use-this
  onFormMediaSubmit(event) {
    event.preventDefault();
  }

  // eslint-disable-next-line class-methods-use-this
  checkMediaSupport() {
    const result = {
      success: true,
      errCode: null,
    };

    if (!navigator.mediaDevices) {
      result.success = false;
      result.errCode = 'noMediaDevices';
      return result;
    }

    if (!window.MediaRecorder) {
      result.success = false;
      result.errCode = 'noMediaRecorder';
      return result;
    }

    return result;
  }

  async showModalInfo(errCode) {
    const messages = {
      noMediaDevices: 'К сожалению, Ваш браузер не поддерживает функцию доступа Timeline мессенджера к аудио/видео устройствам. Пожалуйста, воспользуйтесь другим браузером.',
      noMediaRecorder: 'К сожалению, Ваш браузер не поддерживает функцию записи аудио/видео Timeline мессенджера. Пожалуйста, воспользуйтесь другим браузером.',
      noMicPermission: 'В Вашем браузере запрещен доступ к микрофону. Если Вы хотите сделать аудио запись, разрешите доступ к микрофону.',
      noCameraPermission: 'В Вашем браузере запрещен доступ к веб-камере. Если Вы хотите сделать видео запись, разрешите доступ к веб-камере.',
      audioRecordTrouble: 'Ошибка аудио записи. Проверьте, подключен ли микрофон.',
      videoRecordTrouble: 'Ошибка видео записи. Проверьте, подключена ли веб-камера.',
      noPermissionSupportMic: 'Ошибка аудио записи. Проверьте, подключен ли микрофон и разрешен ли к нему доступ в Вашем браузере.',
      noPermissionSupportCamera: 'Ошибка видео записи. Проверьте, подключена ли веб-камера и разрешен ли к ней доступ в Вашем браузере.',
    };

    this.modals.info.show(messages[errCode]);
    await this.modals.info.getData();
  }

  async createStreamBlob(type) {
    const constraints = {
      audio: true,
      video: false,
    };

    if (type === 'video') constraints.video = true;

    try {
      let stream = null;

      if (type === 'audio') {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } else if (type === 'video') {
        const result = await this.getVideoStream();

        if (!result.success) throw result.err;

        stream = result.stream;

        this.els.userPanelVideo.srcObject = stream;
        this.els.userPanelVideo.play();
        this.els.userPanelVideoWrap.classList.remove('hidden');
        Animate.animationOpacity(this.els.userPanelVideoWrap, 300);
      }

      this.recorder = new MediaRecorder(stream);
      const chunk = [];

      this.recorder.addEventListener('start', () => {
        this.isRecordStopped = false;
        let duration = 0; // Длительность записи в секундах.

        const interval = setInterval(() => {
          if (this.isRecordStopped) {
            clearInterval(interval);
          } else {
            duration += 1;
            const date = new Date(1970, 1, 1, 0, 0, duration);
            this.els.mediaDuration.textContent = date.toLocaleTimeString('ru', { minute: '2-digit', second: '2-digit' });
          }
        }, 1000);
      });

      this.recorder.addEventListener('dataavailable', (event) => {
        chunk.push(event.data);
      });

      this.recorder.addEventListener('stop', () => {
        this.isRecordStopped = true;
        const content = new Blob(chunk);
        if (this.mediaStopBtn === 'send') this.createPost({ type, content });

        if (type === 'video') {
          this.els.userPanelVideo.src = null;
          Animate.animationOpacityReverse(this.els.userPanelVideoWrap, 300);
          setTimeout(() => this.els.userPanelVideoWrap.classList.add('hidden'), 300);
        }

        Animate.animationOpacityReverse(this.els.mediaStop, 300);
        setTimeout(() => this.els.mediaStop.classList.add('hidden'), 300);

        this.els.mediaStart.classList.remove('hidden');
        Animate.animationOpacity(this.els.mediaStart, 300);
        stream.getTracks().forEach((track) => track.stop());
      });

      this.els.mediaDuration.textContent = '00:00';
      Animate.animationOpacityReverse(this.els.mediaStart, 300);
      setTimeout(() => this.els.mediaStart.classList.add('hidden'), 300);

      this.els.mediaStop.classList.remove('hidden');
      Animate.animationOpacity(this.els.mediaStop, 300);
      this.recorder.start();
    } catch (e) {
      const err = {
        audio: {
          name: 'microphone',
          textPermission: 'noMicPermission',
          textRecordTrouble: 'audioRecordTrouble',
          noPermissionSupport: 'noPermissionSupportMic',
        },
        video: {
          name: 'camera',
          textPermission: 'noCameraPermission',
          textRecordTrouble: 'videoRecordTrouble',
          noPermissionSupport: 'noPermissionSupportCamera',
        },
      };

      try {
        const micStatusPermission = await navigator.permissions.query({ name: err[type].name });

        if (micStatusPermission.state === 'denied') {
          await this.showModalInfo(err[type].textPermission);
          return;
        }

        await this.showModalInfo(err[type].textRecordTrouble);
      } catch (e2) {
        await this.showModalInfo(err[type].noPermissionSupport);
      }
    }
  }

  async onBtnAudioClick() {
    const result = this.checkMediaSupport();

    if (!result.success) {
      await this.showModalInfo(result.errCode);
      return;
    }

    this.postType = 'audio';
    this.createStreamBlob(this.postType);
  }

  onBtnSendClick() {
    this.mediaStopBtn = 'send';
    this.recorder.stop();
  }

  onBtnCancelClick() {
    this.mediaStopBtn = 'cancel';
    this.recorder.stop();
  }

  // eslint-disable-next-line class-methods-use-this
  async getVideoStream() {
    const result = {
      success: true,
      stream: null,
      err: null,
    };

    try {
      result.stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      return result;
    } catch (e1) {
      try {
        result.stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: true,
        });
        return result;
      } catch (e2) {
        result.success = false;
        result.err = e2;
        return result;
      }
    }
  }

  async onBtnVideoClick() {
    const result = this.checkMediaSupport();

    if (!result.success) {
      await this.showModalInfo(result.errCode);
      return;
    }

    this.postType = 'video';
    this.createStreamBlob(this.postType);
  }
}
