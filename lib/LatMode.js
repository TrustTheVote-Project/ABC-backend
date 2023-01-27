const latModeKey = "markit-lat";

exports.getLatModeFromEvent = (event) => {
  const latMode =
    event &&
    event.headers &&
    ((event.headers["User-Agent"] || "").toLowerCase().indexOf(latModeKey) >=
      0 ||
      (event.headers["user-agent"] || "").toLowerCase().indexOf(latModeKey) >=
        0 ||
      (event.headers["X-User-Agent"] || "").toLowerCase().indexOf(latModeKey) >=
        0 ||
      (event.headers["x-user-agent"] || "").toLowerCase().indexOf(latModeKey) >=
        0)
      ? 1
      : 0;
  return latMode;
};
