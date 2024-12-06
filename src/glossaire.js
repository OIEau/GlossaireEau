/**
 * glossaire.js
 *
 * Contains the main class for the
 * glossary utility of the module.
 *
 */

class Glossary {


    constructor() {
        this.glossary_data = require('../assets/glossaire.json');

        // Remove objects without Libelle.
        this.glossary_data = this.glossary_data.filter(function (el) {
            return el.Libelle !== undefined;
        });

        // Sort glossary by length of Libelle.
        this.glossary_data.sort(function (a, b) {
            return b.Libelle.length - a.Libelle.length;
        });

        this.tippyInstances = [];
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

        if (typeof attr !== 'undefined' && attr !== '') {
            var queries = attr.split('|');
            var elements = [];
            for (var i = queries.length - 1; i >= 0; i--) {
                var elem = document.querySelectorAll(queries[i]);
                if (elem !== null) {
                    for (var i = elem.length - 1; i >= 0; i--) {
                        elements.push(elem[i]);
                    }
                }
            }
            if (elements.length > 0) {
                return elements;
            }
        }

        // Default to body.
        return [document.body];
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

        if (typeof attr !== 'undefined' && attr !== '') {
            var queries = attr.split('|');
            var elements = [];
            for (var i = queries.length - 1; i >= 0; i--) {
                var elem = document.querySelectorAll(queries[i]);
                if (elem !== null) {
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
        if (typeof blacklist !== 'undefined' && blacklist !== '') {
            blacklistedWords = blacklist.split('|');
            for (var i = blacklistedWords.length - 1; i >= 0; i--) {
                blacklistedWords[i] = utils.normalizeString(blacklistedWords[i]);
            }
        }

        this.glossary_data.forEach((concept, i) => {
            if (typeof concept.Libelle !== "undefined" && blacklistedWords.indexOf(utils.normalizeString(concept.Libelle)) > -1) {
                return;
            }
            const searchMask = concept.Libelle;
            const replaceMask = "$0";

            utils.replaceAllWith(divToProcess, searchMask, replaceMask, i);
        });
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
        if (typeof blacklist !== 'undefined' && blacklist !== '') {
            blacklistedWords = blacklist.split('|');
            for (var i = blacklistedWords.length - 1; i >= 0; i--) {
                blacklistedWords[i] = utils.normalizeString(blacklistedWords[i]);
            }
        }

        function processInBatch(glossary_data, glossary) {
            const maxTimePerChunk = 10;
            let index = 0;

            function now() {
                return performance.now()
            }

            function doChunk() {
                const startTime = now();
                while (index < glossary_data.length && (now() - startTime) <= maxTimePerChunk) {
                    const concept = glossary_data[index];
                    if (typeof concept.Libelle !== "undefined" && blacklistedWords.indexOf(utils.normalizeString(concept.Libelle)) > -1) {
                        index++;
                        continue;
                    }
                    const searchMask = concept.Libelle;
                    const replaceMask = "$0";

                    utils.replaceAllWith(divToProcess, searchMask, replaceMask, index);
                    index++;
                }
                if (index < glossary_data.length) {
                    requestAnimationFrame(doChunk)
                } else {
                    glossary.deferredProcess(glossary)
                }
            }

            requestAnimationFrame(doChunk)
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
        const elements = divToProcess.querySelectorAll('._geau_glossary_concept');

        elements.forEach(element => {
            element.setAttribute("style", "border-bottom: 1px dashed #333;");
            element.setAttribute("tabindex", 0);

            // Wrap the reference element in a span to always allow tab navigation to the link, clone the element to be able to use replaceChild
            const span = document.createElement('span');
            const elementClone = element.cloneNode(true);
            span.appendChild(elementClone);
            element.parentNode.replaceChild(span, element);

            const conceptIndex = utils.getConceptIndexFromElement(element);
            const instance = tippy(elementClone, {
                content: this.buildTooltipContent(conceptIndex),
                allowHTML: true,
                arrow: true,
                interactive: true,
                maxWidth: 500,
                delay: 100,
                appendTo: span,
                animation: 'shift-away',
                onShown(instance) {
                    document.querySelector('.tippy-content a').addEventListener('focusout', () => elementClone._tippy.hide())
                    _paq.push([
                        'trackEvent',
                        'Affiche Definition',
                        'Affiche Popup',
                        `concept : ${utils.getLibelleFromHTMLContent(instance.popper.innerHTML)}, page appelante : ${window.location.href}`
                    ]);
                }
            });
            this.tippyInstances.push(instance)
        })
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

            if (el === null) {
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
        const glossary = this.getGlossaryData();

        let html = `<div class="geau__header">
        <div>
        <h4>${glossary[conceptIndex].Libelle}`;
        if (typeof glossary[conceptIndex].Sigle !== 'undefined' && glossary[conceptIndex].Sigle !== '') {
            html += ` (${glossary[conceptIndex].Sigle})`;
        }
        html += `</h4>
        <h6>Sens ${glossary[conceptIndex].Sens}</h6>
        </div>
        <img class="geau__logo" width="130" height="48" src='https://glossaire.eauetbiodiversite.fr/themes/custom/glossaireless/img/glossaire-logo400-removebg.png' alt="Logo glossaire eau et biodiversité">
        </div>
        <p class="geau__definition">${utils.truncate(glossary[conceptIndex].Definition, 350)}</p>
        <p class="geau__source"><u>Source</u> : ${glossary[conceptIndex].Source}</p>
        <p class="geau__link">
        <a target="_blank" href="https://glossaire.eauetbiodiversite.fr/node/${glossary[conceptIndex].Id}" 
        onclick="_paq.push(['trackLink', 'https://glossaire.eauetbiodiversite.fr/concept/${utils.normalizeString(glossary[conceptIndex].Libelle).replace(/[’']/g, "\\'")}', 'link']);_paq.push(['trackEvent', 'Affiche Definition', 'Clic En savoir plus', 'concept : ${utils.normalizeString(glossary[conceptIndex].Libelle).replace(/[’']/g, "\\'")}, page appelante : ${window.location.href}']);">En savoir plus sur <i><u>glossaire.eauetbiodiversite.fr</u></i>
        </a>
        </p>`;

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
        const targets = glossary.getTargetsToProcess(document);

        for (var i = targets.length - 1; i >= 0; i--) {
            // Process the found terms to add tooltips and definitions.
            glossary.processTagsInPage(targets[i]);
            // Cleanup.
            glossary.cleanupTags(targets[i]);
        }

        // Get DOM element to exclude and remove tags.
        const excluded = glossary.getExcludedToProcess(document);
        excluded.forEach(element => glossary.removeTags(element));
    }


    /**
     * Prepare Matomo tracking
     */
    matomoTrack() {
        _paq.push(['setDomains', 'glossaire.eauetbiodiversite.fr']);
        _paq.push(['trackPageView']);
        _paq.push(['enableLinkTracking']);
        (function () {
            const u = "https://po.oieau.fr/piwik/";
            _paq.push(['setTrackerUrl', u + 'matomo.php']);
            _paq.push(['setSiteId', '39']);
            const d = document, g = d.createElement('script'), s = d.getElementsByTagName('script')[0];
            g.type = 'text/javascript';
            g.async = true;
            g.src = u + 'matomo.js';
            s.parentNode.insertBefore(g, s);
        })();
    }
}

/**
 *
 * Main.
 *
 */

// Import dependencies.
const utils = require('./utils');
import tippy from 'tippy.js';
require('./style.css'); // browserify-css will automatically inject the css into the page

const glossary = new Glossary();

window.onload = function () {
    // Configure Matomo tracking
    const _paq = window._paq = window._paq || [];
    glossary.matomoTrack();

    // Get DOM element to process.
    const targets = glossary.getTargetsToProcess(document);

    // Count text nodes to determine which process to follow (batch or regular).
    let countTextNodes = 0;
    targets.forEach(target => countTextNodes += utils.countText(target))

    // If heavy page, treat in batch and prevent main thread freeze.
    if (countTextNodes > 100) {
        targets.forEach(target => glossary.batchTagConceptsInPage(target))
    } else {
        targets.forEach(target => {
            // Look for the glossary terms in the DOM.
            glossary.tagConceptsInPage(target)
            // Process the found terms to add tooltips and definitions.
            glossary.processTagsInPage(target)
            // Cleanup.
            glossary.cleanupTags(target)
        })

        // Get DOM element to exclude and remove tags.
        const excluded = glossary.getExcludedToProcess(document);
        excluded.forEach(element => glossary.removeTags(element));
    }

    // Listen to the escape keyup event and hide any opened instance of tippy
    document.addEventListener('keyup', function (event) {
        if (event.key === 'Escape') {
            glossary.tippyInstances.forEach(instance => {
                if (instance.state.isVisible) {
                    instance.hide()
                }
            })
        }
    });

};
