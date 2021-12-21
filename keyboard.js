window.addEventListener('keyup', function (event) { Key.onKeyup(event); }, false);
window.addEventListener('keydown', function (event) { Key.onKeydown(event); }, false);

var Key = {
  _pressed: {},

  R: 82,
  SPACE: 32,
  ESC:27,

  isDown: function (keyCode) {
    // output =  this._pressed[keyCode];
    // this._pressed[keyCode] = false;
    return this._pressed[keyCode];
  },

  onKeydown: function (event) {
    this._pressed[event.keyCode] = true;
  },

  onKeyup: function (event) {
    this._pressed[event.keyCode] = false;
  }
};