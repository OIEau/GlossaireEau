/**
 * glossaire.js
 *
 * Contains the main class for the
 * glossary utility of the module.
 *
 */

class Glossary {

  constructor () {
    this.glossary_data = require('../assets/glossaire.json');

    // Sort so that longer words come first.
    this.glossary_data.sort(function(a, b) {
      if(typeof a.Libelle !== 'undefined' && typeof b.Libelle !== 'undefined') {
        return b.Libelle.length - a.Libelle.length;
      }
    });
  }

  /**
   *
   * getGlossaryData
   *
   * Get data from glossary.
   *
   */
  getGlossaryData() {
    return this.glossary_data;
  }

  /**
   *
   * getTargetsToProcess
   *
   * Retrieve elements from DOM to be processed by the automatic glossary.
   * If elements are not specified in script,
   * default to body element.
   *
   * params:
   *   document: DOM
   */
  getTargetsToProcess(document) {
    // Get attribute from include script.
    var attr = document.getElementById('_geaujs').dataset.target;

    if(typeof attr !== 'undefined' && attr !== '') {
      var queries = attr.split('|');
      var elements = [];
      for (var i = queries.length - 1; i >= 0; i--) {
        var elem = document.querySelectorAll(queries[i]);
        if(elem !== null) {
          for (var i = elem.length - 1; i >= 0; i--) {
            elements.push(elem[i]);
          }
        }
      }
      if(elements.length > 0) {
        return elements;
      }
    }

    // Default to body.
    return document.body;
  }


  /**
   *
   * getExcludedToProcess
   *
   * Remove tags from specified excluded elements.
   *
   * params:
   *   document: DOM
   */
  getExcludedToProcess(document) {
    // Get attribute from include script.
    var attr = document.getElementById('_geaujs').dataset.exclude;

    if(typeof attr !== 'undefined' && attr !== '') {
      var queries = attr.split('|');
      var elements = [];
      for (var i = queries.length - 1; i >= 0; i--) {
        var elem = document.querySelectorAll(queries[i]);
        if(elem !== null) {
          for (var j = elem.length - 1; j >= 0; j--) {
            elements.push(elem[j]);
          }
        }
      }
      return elements;
    }

    return [];
  }

 
  /**
   *
   * tagConceptsInPage
   *
   * Go through glossary terms and tag those
   * which are present on the page.
   *
   * params:
   *   divToProcess: DOM Element to process
   */
  tagConceptsInPage(divToProcess) {
    var blacklist = document.getElementById('_geaujs').dataset.blacklist;
    var blacklistedWords = [];
    if(typeof blacklist !== 'undefined' && blacklist !== '') {
      blacklistedWords = blacklist.split('|');
      for (var i = blacklistedWords.length - 1; i >= 0; i--) {
        blacklistedWords[i] = utils.normalizeString(blacklistedWords[i]);
      }
    }

    for (var i = 0; i < this.glossary_data.length; i++) {
      var concept = this.glossary_data[i];
      if(typeof concept.Libelle !== "undefined" && blacklistedWords.indexOf(utils.normalizeString(concept.Libelle)) > -1) {
        continue;
      }
      var searchMask = concept.Libelle;
      var replaceMask = "$0";

      utils.replaceAllWith(divToProcess, searchMask, replaceMask, i);
    }
  }


  /**
   *
   * batchTagConceptsInPage
   *
   * Go through glossary terms and tag those
   * which are present on the page.
   *
   * params:
   *   divToProcess: DOM Element to process
   */
  batchTagConceptsInPage(divToProcess) {
    var blacklist = document.getElementById('_geaujs').dataset.blacklist;
    var blacklistedWords = [];
    if(typeof blacklist !== 'undefined' && blacklist !== '') {
      blacklistedWords = blacklist.split('|');
      for (var i = blacklistedWords.length - 1; i >= 0; i--) {
        blacklistedWords[i] = utils.normalizeString(blacklistedWords[i]);
      }
    }

    function processInBatch(glossary_data, glossary) {
      var maxTimePerChunk = 100;

      var index = 0;

      function now() {
        return new Date().getTime();
      }

      function doChunk() {
        var startTime = now();
        while (index < glossary_data.length && (now() - startTime) <= maxTimePerChunk) {
          var concept = glossary_data[index];
          if(typeof concept.Libelle !== "undefined" && blacklistedWords.indexOf(utils.normalizeString(concept.Libelle)) > -1) {
            index++;
            continue;
          }
          var searchMask = concept.Libelle;
          var replaceMask = "$0";

          utils.replaceAllWith(divToProcess, searchMask, replaceMask, index);
          index++;
        }
        if (index < glossary_data.length) {
          setTimeout(doChunk, 1);
        } else {
          glossary.deferredProcess(glossary);
        }
      }
      doChunk();
    }

    processInBatch(this.glossary_data, this);
  }

  /**
   *
   * processTagsInPage
   *
   * Process previously tagged terms to add
   * necessary tooltips and definitions.
   *
   * params:
   *   divToProcess: DOM Element to process
   */
  processTagsInPage(divToProcess) {
    // Get tagged elements in page.
    var elements = divToProcess.querySelectorAll('._geau_glossary_concept');

    for (var i = 0; i < elements.length; i++) {
      elements[i].setAttribute("style", "border-bottom: 1px dashed #333;");
      var conceptIndex = utils.getConceptIndexFromElement(elements[i]);
      tippy(elements[i], {
        content: this.buildTooltipContent(conceptIndex),
        allowHTML: true,
        arrow: true,
        interactive: true,
        maxWidth: 500,
        delay: [500, 100],
        ignoreAttributes: true,
        inertia: true,
        size: 'large',
        sticky: true
      });
    }
  }

  /**
   *
   * cleanupTags
   *
   * Removes nested terms.
   *
   * params:
   *   divToProcess: DOM Element to process
   */
  cleanupTags(divToProcess) {
    // Get tagged elements in page.
    var elements = divToProcess.querySelectorAll('._geau_glossary_concept');

    // Remove nested terms.
    for (var i = 0; i < elements.length; i++) {
      var el = elements[i].querySelectorAll('span._geau_glossary_concept');

      if(el === null) {
        continue;
      }

      for (var j = el.length - 1; j >= 0; j--) {
        var parent = el[j].parentNode;
        while (el[j].firstChild) parent.insertBefore(el[j].firstChild, el[j]);
        parent.removeChild(el[j]);
      }
    }
  }

  /**
   *
   * removeTags
   *
   * Removes tags from element.
   *
   * params:
   *   divToProcess: DOM Element to process
   */
  removeTags(divToProcess) {
    // Get tagged elements in page.
    var elements = divToProcess.querySelectorAll('._geau_glossary_concept');

    // Remove nested terms.
    for (var i = 0; i < elements.length; i++) {
      var parent = elements[i].parentNode;
      while (elements[i].firstChild) parent.insertBefore(elements[i].firstChild, elements[i]);
      parent.removeChild(elements[i]);
    }
  }

  /**
   *
   * buildTooltipContent
   *
   * Given a term, return HTML to insert in tooltip.
   *
   * params:
   *   divToProcess: DOM Element to process
   */
  buildTooltipContent(conceptIndex) {
    var glossary = this.getGlossaryData();

    var html = "";
    html += "<img style='width:130px!important; float:right' src='https://glossaire.eauetbiodiversite.fr/themes/custom/glossaireless/img/glossaire-logo400-removebg.png'>";
    html += "<h4 style='color: #FFFFFF;text-align:left;font-size: 16px;font-family: \"Trebuchet MS\", Helvetica, sans-serif; padding: 0 0 5px 0!important;margin:0!important;'>";
    html += glossary[conceptIndex].Libelle;
    if (typeof glossary[conceptIndex].Sigle !== 'undefined' && glossary[conceptIndex].Sigle !== '') {
      html += " (" + glossary[conceptIndex].Sigle + ")";
    }
    html += "</h4>";
    html += "<h6 style='color: #EEEEEE;text-align:left;font-family: Georgia, serif;font-size: 13px; font-style: italic;padding: 0 0 5px 0!important;margin:0!important;'>Sens " + glossary[conceptIndex].Sens + "</h6>";
    html += "<p style='color: #CCCCCC; text-align:left;font-size: 12px;padding: 0 0 5px 0!important;margin:0!important;'>" + utils.truncate(glossary[conceptIndex].Definition, 350) + "</p>";
    html += "<p style='text-align:left;font-size: 11px;padding: 0 0 5px 0!important;margin:0!important;'><u>Source</u> : " + glossary[conceptIndex].Source + "</p>";
    html += "<p style='text-align:center;margin: 10px 0;'><a style='margin:0!important;display: inline-block; width: 60%; font-size: 13px; font-weight: bold; background:#1a9ee9; border-radius: 5px; color: #FFFFFF; padding: 5px 15px;' target='_blank' href='https://glossaire.eauetbiodiversite.fr/node/"  + glossary[conceptIndex].Id +  "'>En savoir plus sur <i><u>glossaire.eauetbiodiversite.fr</u></i></a></p>";

    return html;
  }


  /**
   *
   * deferredProcess
   *
   * Launch process and cleanup after batch.
   *
   */
  deferredProcess(glossary) {
    var targets = glossary.getTargetsToProcess(document);

    for (var i = targets.length - 1; i >= 0; i--) {
      // Process the found terms to add tooltips and definitions.
      glossary.processTagsInPage(targets[i]);

      // Cleanup.
      glossary.cleanupTags(targets[i]);
    }

    // Get DOM element to exclude and remove tags.
    var excluded = glossary.getExcludedToProcess(document);
    for (var i = excluded.length - 1; i >= 0; i--) {
      glossary.removeTags(excluded[i]);
    }
  }
}

/**
 *
 * Main.
 *
 */

// Import dependencies.
var utils = require('./utils');
var tippy = require('tippy.js');

var glossary = new Glossary();

window.onload = function () {
  // Get DOM element to process.
  var targets = glossary.getTargetsToProcess(document);

  // Count text nodes to determine
  // which process to follow (batch or regular).
  var countTextNodes = 0;
  for (var i = targets.length - 1; i >= 0; i--) {
    countTextNodes += utils.countText(targets[i]);
  }

  // If heavy page, treat in batch and prevent
  // main thread freeze.
  if (countTextNodes > 1500) {
    for (var i = targets.length - 1; i >= 0; i--) {
      // Look for the glossary terms in the DOM.
      glossary.batchTagConceptsInPage(targets[i]);
    }
  } else {
    for (var i = targets.length - 1; i >= 0; i--) {
      // Look for the glossary terms in the DOM.
      glossary.tagConceptsInPage(targets[i]);

      // Process the found terms to add tooltips and definitions.
      glossary.processTagsInPage(targets[i]);

      // Cleanup.
      glossary.cleanupTags(targets[i]);
    }

    // Get DOM element to exclude and remove tags.
    var excluded = glossary.getExcludedToProcess(document);
    for (var i = excluded.length - 1; i >= 0; i--) {
      glossary.removeTags(excluded[i]);
    }
  }
};
