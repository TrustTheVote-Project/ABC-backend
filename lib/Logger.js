

class Logger {

  static _stringify(obj) {
    if (!obj) {
      return "falsey value: " + typeof(obj)
    }
    if (typeof(obj)==="string") {
      return obj;
    }
    if (typeof(obj)==="object") {
      return JSON.stringify(obj, null, 2)
    }
  }

  static debug(obj) {
    if (process.env.AWS_SAM_LOCAL) {
      const obj_as_string = this._stringify(obj);
      process.stdout.write(obj_as_string + "\n")
    }
  }

  static log(obj) {
    this.debug(obj)
    // TODO
  }
}

exports.Logger = Logger;
