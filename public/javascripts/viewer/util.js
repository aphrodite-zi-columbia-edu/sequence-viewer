/**
 * I dont really know how jQuery works, I guess.
 */
function getValueOfFirstTextNode(parent) {
  var children = $(parent).children();
  var value = null;
  for (i in children) {
    var child = children[i];
    if (child.nodeType === Node.TEXT_NODE) {
        value = child.data;
    }
  }
  return value;
}

// https://j11y.io/javascript/regex-selector-for-jquery/
jQuery.expr[':'].regex = function(elem, index, match) {
  var matchParams = match[3].split(','),
  validLabels = /^(data|css):/,
  attr = {
    method: matchParams[0].match(validLabels)
      ? matchParams[0].split(':')[0]
      : 'attr',
    property: matchParams.shift().replace(validLabels,'')
  },
  regexFlags = 'ig',
  regex = new RegExp(matchParams.join('').replace(/^\s+|\s+$/g,''), regexFlags);
  return regex.test(jQuery(elem)[attr.method](attr.property));
}
