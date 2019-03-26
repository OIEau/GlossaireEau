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
        var elem = document.querySelector(queries[i]);
        if(elem !== null) {
          elements.push(elem);
        }
      }
      return elements;
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
        var elem = document.querySelector(queries[i]);
        if(elem !== null) {
          elements.push(elem);
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
    for (var i = 0; i < this.glossary_data.length; i++) {
      var concept = this.glossary_data[i];
      var searchMask = concept.Libelle;
      var replaceMask = "$0";

      utils.replaceAllWith(divToProcess, searchMask, replaceMask, i);
    }
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
    html += "<img style='width:100px!important; height:53px!important;float:right' src=' data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAA1CAYAAAC3ME4GAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyNpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChNYWNpbnRvc2gpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjRBNDlGNzg3NDNENDExRTlCOTkzQTkzQ0Q4N0QyQUMzIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjRBNDlGNzg4NDNENDExRTlCOTkzQTkzQ0Q4N0QyQUMzIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NEE0OUY3ODU0M0Q0MTFFOUI5OTNBOTNDRDg3RDJBQzMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6NEE0OUY3ODY0M0Q0MTFFOUI5OTNBOTNDRDg3RDJBQzMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4keOVYAAAXEklEQVR42uxcCXQc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'>";
    html += "<h4 style='color: #FFFFFF;text-align:left;font-size: 16px;font-family: \"Trebuchet MS\", Helvetica, sans-serif; padding: 0 0 5px 0!important;margin:0!important;'>";
    html += glossary[conceptIndex].Libelle;
    if (typeof glossary[conceptIndex].Sigle !== 'undefined' && glossary[conceptIndex].Sigle !== '') {
      html += " (" + glossary[conceptIndex].Sigle + ")";
    }
    html += "</h4>";
    html += "<h6 style='color: #EEEEEE;text-align:left;font-family: Georgia, serif;font-size: 13px; font-style: italic;padding: 0 0 5px 0!important;margin:0!important;'>Sens " + glossary[conceptIndex].Sens + "</h6>";
    html += "<p style='color: #CCCCCC; text-align:left;font-size: 12px;padding: 0 0 5px 0!important;margin:0!important;'>" + utils.truncate(glossary[conceptIndex].Definition, 350) + "</p>";
    html += "<p style='text-align:left;font-size: 11px;padding: 0 0 5px 0!important;margin:0!important;'><u>Source</u> : " + glossary[conceptIndex].Source + "</p>";
    html += "<p style='text-align:center;margin: 10px 0;'><a style='margin:0!important;display: inline-block; width: 60%; font-size: 13px; font-weight: bold; background:#1a9ee9; border-radius: 5px; color: #FFFFFF; padding: 5px 15px;' target='_blank' href='http://www.glossaire-eau.fr/node/"  + glossary[conceptIndex].Id +  "'>En savoir plus sur <i><u>glossaire-eau.fr</u></i></a></p>";

    return html;
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
};
