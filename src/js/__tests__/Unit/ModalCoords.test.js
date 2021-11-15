/**
 * @jest-environment jsdom
 */

import ModalCoords from '../../modal/coords/ModalCoords';

describe('ModalCoords', () => {
  const _ = new ModalCoords();

  describe('должен отобразить сообщение об ошибке, если пользователь вводит неверные данные', () => {
    test.each([
      '',
      '511.50851, −0.12572',
      '-5.50851, 120.12572',
      '123.50851, −10.12572',
      '-51.50851, −123.12572',
      '-123.50851, −01.12572',
    ])('\'%s\'', (coords) => {
      _.els.input.value = coords;
      _.els.btnSend.click();
      expect(_.els.errMsg.classList.contains('hidden')).toBeFalsy();
    });
  });

  describe('должен не отображать сообщение об ошибке, если пользователь вводит корректные данные', () => {
    test.each([
      '51.50851,-0.12572',
      '51.50851, 0.12572',
      '-51.5085123, 0.12572',
      '[51.50851, 0.12572]',
      '[-51.508523,0.1257223]',
    ])('\'%s\'', async (coords) => {
      _.show('');
      setTimeout(() => {
        _.els.input.value = coords;
        _.els.btnSend.click();
      }, 0);
      await _.getData();
      expect(_.els.errMsg.classList.contains('hidden')).toBeTruthy();
      _.hide();
    });
  });

  describe('должен возвращать объект с координатами, если пользователь вводит данные', () => {
    test.each`
    latitude     | longitude
    ${51.50851}  | ${0.12572}
    ${-15.50851} | ${-10.12572}
    ${5.5085123} | ${0.1257223}
    `('\'$latitude, $longitude\'', async ({ latitude, longitude }) => {
      const userEnter = `${latitude}, ${longitude}`;
      _.show('');
      setTimeout(() => {
        _.els.input.value = userEnter;
        _.els.btnSend.click();
      }, 0);

      const result = await _.getData();
      const { coords } = result;

      expect(result.success).toBeTruthy();
      expect(coords.latitude).toBe(latitude);
      expect(coords.longitude).toBe(longitude);
    });
  });
});
