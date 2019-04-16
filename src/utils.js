/**
 * utils.js
 *
 * This file defines utility functions
 * useful for the main script.
 *
 */


module.exports = {
  truncate: function(str, length){
    if (str.length > length) {
      return str.substring(0, length) + '...';
    } else {
      return str;
    }
  },

  countText: function(node){
    var counter = 0;
    if(node.nodeType === 3){
      counter++;
    } else if(node.nodeType === 1) {
      var children = node.childNodes;
      for(var i = children.length; i--; ) {
        counter += this.countText(children[i]);
      }
    }
    return counter;
  },

  normalizeString(stringToCorrect) {
    var correctedString = stringToCorrect.toUpperCase();
    correctedString = correctedString.replace(/[ÁÀÄÂ]/, "A");
    correctedString = correctedString.replace(/[ÉÈËÊ]/, "E");
    correctedString = correctedString.replace(/[ÍÌÏÎ]/, "I");
    correctedString = correctedString.replace(/[ÓÒÖÔ]/, "O");
    correctedString = correctedString.replace(/[ÚÙÜÛ]/, "U");
    return correctedString;
  },


  escapeRegExp: function(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
  },

  replaceAllWith: function (div, strReplace, strWith, conceptIndex) {
    var fr = require('findandreplacedomtext');

    fr.findAndReplaceDOMText(div, {
      preset: 'prose',
      find: RegExp('\\b' + strReplace + '\\b', 'gi'),
      portionMode: 'first',
      wrap: 'span',
      wrapClass: '_geau_glossary_concept ' + conceptIndex
    });
  },

  getConceptIndexFromElement: function (element) {
    var classes = element.getAttribute('class');
    var classList = classes.split(' ');
    for (var i = 0; i < classList.length; i++) {
      if(Number.isInteger(parseInt(classList[i]))) {
        return classList[i];
      }
    }
  }
};