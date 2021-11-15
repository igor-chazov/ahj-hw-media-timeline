/* eslint-disable no-param-reassign */
/* eslint-disable func-names */
export default class Animate {
  static animate({ timing, draw, duration }) {
    const start = performance.now();

    requestAnimationFrame(function animate(time) {
      let timeFraction = (time - start) / duration;
      if (timeFraction > 1) timeFraction = 1;

      const progress = timing(timeFraction);

      draw(progress);

      if (timeFraction < 1) {
        requestAnimationFrame(animate);
      }
    });
  }

  static makeEaseOut(timing) {
    return function (timeFraction) {
      return 1 - timing(1 - timeFraction);
    };
  }

  static linear(timeFraction) {
    return timeFraction;
  }

  static quad(timeFraction) {
    return timeFraction ** 2;
  }

  static bounce(timeFraction) {
    for (let a = 0, b = 1; ; a += b, b /= 2) {
      if (timeFraction >= (7 - 4 * a) / 11) {
        return -(((11 - 6 * a - 11 * timeFraction) / 4) ** 2) + b ** 2;
      }
    }
  }

  static animationOpacity(animateEl, duration) {
    Animate.animate({
      duration,
      timing: Animate.makeEaseOut(Animate.linear),
      draw(progress) {
        animateEl.style.opacity = progress;
      },
    });
  }

  static animationOpacityReverse(animateEl, duration) {
    Animate.animate({
      duration,
      timing: Animate.makeEaseOut(Animate.linear),
      draw(progress) {
        animateEl.style.opacity = 1 - progress;
      },
    });
  }
}
