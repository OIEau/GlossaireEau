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
    let counter = 0;
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
    let correctedString = stringToCorrect.toUpperCase();
    correctedString = correctedString.replace(/[ÁÀÄÂ]/, "A");
    correctedString = correctedString.replace(/[ÉÈËÊ]/, "E");
    correctedString = correctedString.replace(/[ÍÌÏÎ]/, "I");
    correctedString = correctedString.replace(/[ÓÒÖÔ]/, "O");
    correctedString = correctedString.replace(/[ÚÙÜÛ]/, "U");
    return correctedString;
  },

  replaceAllWith: function (div, strReplace, strWith, conceptIndex) {
    const fr = require('findandreplacedomtext');

    // The final regex must match both ’ and ' characters in the web page or in the glossary
    if (strReplace.includes("’") || strReplace.includes("'")) {
      strReplace = strReplace.replace(/[’']/g, "[’']");
    }

    let options = {
      preset: 'prose',
      find: RegExp(`(?<=\\b|[^\\w])${strReplace}(?=\\b|[^\\w]|$)`, 'gi'),
      portionMode: 'first',
      wrap: 'span',
      wrapClass: '_geau_glossary_concept ' + conceptIndex,
    };

    fr.findAndReplaceDOMText(div, options);

    if (!strReplace || strReplace === '') {
        return;
    }
    strReplace = this.normalizeString(strReplace);
    options.find = RegExp(`(?<=\\b|[^\\w])${strReplace}(?<=\\b|[^\\w]|$)`, 'gi');
    fr.findAndReplaceDOMText(div, options);
  },

  getConceptIndexFromElement: function (element) {
    const classes = element.getAttribute('class');
    const classList = classes.split(' ');
    for (let i = 0; i < classList.length; i++) {
      if(Number.isInteger(parseInt(classList[i]))) {
        return classList[i];
      }
    }
  },

  getLibelleFromHTMLContent(content){
    let HTMLBeforeLibelle = "_paq.push(['trackEvent', 'Affiche Definition', 'Clic En savoir plus', 'concept : ";
    let HTMLAfterLibelle = ", page appelante : ";
    return content.substring(content.indexOf(HTMLBeforeLibelle) + HTMLBeforeLibelle.length, content.indexOf(HTMLAfterLibelle));
  }, 

};