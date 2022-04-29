class ApiRequire {
  static hasRequiredArgs(requiredArgs, suppliedArgs) {
    //require all args and disallow empty string
    return (
      suppliedArgs &&
      requiredArgs.every(
        (x) =>
          suppliedArgs.hasOwnProperty(x) &&
          suppliedArgs[x] &&
          suppliedArgs[x] != ""
      )
    );
  }
}
exports.ApiRequire = ApiRequire;
