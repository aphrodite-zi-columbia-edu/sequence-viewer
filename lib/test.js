#!/usr/bin/env node

function main() {
  // if (process.argv.slice(2).filter((s) => s.indexOf("-v") > -1 || s.indexOf("--verbose") > -1).length) {
  //   console.log("verbose");
  //   // console.log(process.argv.slice(2));
  // }

  SEQUENCE_VIEWER_CONFIGURATION = {
    csv: { column: 5 }
  }
  SEQUENCE_VIEWER_CONFIGURATION = {
    // mysql: { column: 5 }
  }

  var variable =
    SEQUENCE_VIEWER_CONFIGURATION.csv
      ? SEQUENCE_VIEWER_CONFIGURATION.csv.column
      :
    SEQUENCE_VIEWER_CONFIGURATION.mysql
      ? SEQUENCE_VIEWER_CONFIGURATION.mysql.column
      :
    (function() { throw new Error("no variable found")})();
}
// console.log(main());
main();
