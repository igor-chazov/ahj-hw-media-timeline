import html from './modal-coords.html';
import './modal-coords.css';
import ModalTimeline from '../ModalTimeline';

export default class ModalCoords extends ModalTimeline {
  constructor({ params } = {}) {
    super({ html, params });
    this.els = {
      ...this.els,
      text: null,
      form: null,
      input: null,
      btnSend: null,
      errMsg: null,
    };

    this.result = {
      success: null,
      publishWithoutCoords: null,
      coords: {},
    };

    this.init();
  }

  init() {
    this.els.text = this.element.querySelector('.modal__text');
    this.els.form = this.element.querySelector('.form-modal');
    this.els.input = this.element.querySelector('.form-modal__input');
    this.els.input.addEventListener('input', this.hideError.bind(this));

    this.els.errMsg = this.element.querySelector('.form-modal__err-msg');

    this.els.btnSend = this.element.querySelector('.form-modal__btn-send');
    this.els.btnSend.addEventListener('click', this.onBtnSendClick.bind(this));
  }

  showError(text) {
    this.els.errMsg.textContent = text;
    this.els.errMsg.classList.remove('hidden');
  }

  hideError() {
    this.els.errMsg.classList.add('hidden');
  }

  onBtnSendClick() {
    this.els.input.pattern = '^\\[?-?\\d{1,2}\\.\\d{5,}, ?-?\\d{1,2}\\.\\d{5,}\\]?$';
    this.els.input.required = true;

    const isValid = this.els.form.checkValidity();

    if (!isValid) {
      let errText = 'Ошибка';
      if (this.els.input.validity.valueMissing) errText = 'Введите координаты';
      else if (this.els.input.validity.patternMismatch) errText = 'Неверный формат';
      this.showError(errText);
      this.els.input.value = '';
      this.els.input.focus();
      this.removeVerifiableAttributes();
      return;
    }

    let coordsStr = this.els.input.value;
    // eslint-disable-next-line no-useless-escape
    coordsStr = coordsStr.replace(/[ \[\]]/g, '');
    const coordsArr = coordsStr.split(',');

    this.result.coords.latitude = parseFloat(coordsArr[0]);
    this.result.coords.longitude = parseFloat(coordsArr[1]);
    this.result.success = true;

    this.resolve(this.result);
    this.removeVerifiableAttributes();
  }

  removeVerifiableAttributes() {
    this.els.input.required = false;
    this.els.input.removeAttribute('pattern');
  }

  show(text = '') {
    this.result.success = false;
    this.result.publishWithoutCoords = false;
    this.result.coords = {};

    this.els.text.textContent = text;
    this.els.input.value = '';
    this.hideError();
    super.show();
  }

  close() {
    this.result.publishWithoutCoords = false;
    super.close();
  }
}
