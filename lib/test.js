function main() {
  
// console.log(process.argv)
// console.log(process.argv.indexOf(""))

  var longPasswords  = process.argv.filter((arg) => (
    arg.match(/^--password=(.*)/)
  ));
  longPasswords = longPasswords.map((pwd) => pwd.match(/^--password=(.*)/)[1]);

  if (!longPasswords.length) {
    var shortPasswords = process.argv.filter((arg) => (
      arg.match(/^-p(.*)/)
    ));
    shortPasswords = shortPasswords.map((pwd) => pwd.match(/^-p(.*)/)[1]);
    return shortPasswords.pop();
  }

  else return longPasswords.pop();


}
console.log(main());
