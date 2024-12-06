[![](https://data.jsdelivr.com/v1/package/npm/glossaire_auto/badge)](https://www.jsdelivr.com/package/npm/glossaire_auto)

# Glossaire eau, milieu marin et biodiversité

![](https://glossaire.eauetbiodiversite.fr/themes/custom/glossaireless/img/glossaire-logo400-removebg.png)

### [Cliquez ici pour voir la démonstration](https://glossaire.eauetbiodiversite.fr/glossaire_auto/demo.html)

Le [Glossaire eau, milieu marin et biodiversité](https://glossaire.eauetbiodiversite.fr/) diffuse, en libre accès, les définitions de plus de 2000 termes sur l'eau, le milieu marin et la biodiversité, en français, anglais et espagnol, pour faciliter la compréhension de ces termes par le plus grand nombre. 

Il est :

- [consultable](https://glossaire.eauetbiodiversite.fr/glossaire) en ligne et [téléchargeable](https://glossaire.eauetbiodiversite.fr/noeud/t%C3%A9l%C3%A9charger-le-glossaire) sous différents formats (HTML, PDF, ASCII, JSON, RDF-XML, OWL) ;
- [collaboratif](https://glossaire.eauetbiodiversite.fr/noeud/comment-devenir-contributeur) car tout internaute peut soumettre une demande de modification ou d’ajout de termes ;
- [partagé](https://glossaire.eauetbiodiversite.fr/noeud/comment-r%C3%A9utiliser-le-glossaire) car son contenu est mis à disposition de tous, et paramétré pour pouvoir alimenter automatiquement d’autres sites web ;
- construit selon les standards du web sémantique (RDF, SKOS, SPARQL, …) permettant ainsi de diffuser des informations structurées et optimisées pour des utilisations plus efficaces et des réutilisations automatisées par des moteurs de recherche et des sites Internet ;
- lié à d’autres bases de connaissances (telles que le [thésaurus eau & biodiversité](https://thesaurus.oieau.fr/thesaurus/), le [thésaurus GEMET](https://www.eionet.europa.eu/gemet/fr/themes/), …) afin de réaliser des agrégations de contenus provenant de différentes sources.
- réutilisable sur le web via l'intégration du script Glosssaire eau, milieu marin et biodiversité

![](https://glossaire.eauetbiodiversite.fr/glossaire_auto/readme.png)


# Comment ça marche

Vous souhaitez intégrer le [Glossaire eau, milieu marin et biodiversité](https://glossaire.eauetbiodiversite.fr/) dans votre site web ? Rien de plus simple !

Copiez le code suivant et insérez-le dans la balise `head` de votre site web :

```
<script type="text/javascript" id="_geaujs" data-target="" data-exclude="" src="https://cdn.jsdelivr.net/npm/glossaire_auto/dist/glossaire_eau.js" defer></script>
```

Par défaut, le traitement des mots et l'affichage des définitions s'effectuera sur la totalité de la page web. 

Pour cibler une ou plusieurs parties de la page, vous pouvez remplir l'attribut `data-target` présent dans le code à intégrer. De la même façon, vous pouvez exclure des parties de la page où vous ne voulez pas voir apparaître de définitions, en remplissant l'attribut `data-exclude`.

Les paramètres à passer dans ces deux attributs sont des [sélecteurs CSS](https://developer.mozilla.org/fr/docs/Web/CSS/S%C3%A9lecteurs_CSS). Plusieurs valeurs sont possibles en les séparant par des barres verticales.

### Exemple

Prenons en exemple le HTML suivant : 

```
<div class='main-content'>
  Le SAGE (Schéma d'aménagement et de gestion des eaux), outil de planification locale...
  <div class='buttons'><a href="#">Modifier</a> / <a href="#">Supprimer</a></div>
</div>
```

Si nous voulons cibler le contenu principal mais exclure les boutons/menus présents dans la page, il faudra que `data-target` contienne `.main-content` et que `data-exclude` contienne `.buttons` :

```
<script type="text/javascript" id="_geaujs" data-target=".main-content" data-exclude=".boutons" src="https://cdn.jsdelivr.net/npm/glossaire_auto/dist/glossaire_eau.js" defer></script>
```

Vous pouvez cibler/exclure plusieurs parties de la page en séparant les valeurs par des barres verticales, par exemple :

```
<script type="text/javascript" id="_geaujs" data-target=".main-content|#front" data-exclude=".boutons|.menu .entry" src="https://cdn.jsdelivr.net/npm/glossaire_auto/dist/glossaire_eau.js" defer></script>
```

Vous pouvez également exclure des mots grâce à l'attribut `data-blacklist` et en les séparant par des barres verticales :

```
<script type="text/javascript" id="_geaujs" data-target=".main-content|#front" data-blacklist="port|laisse|pression" src="https://cdn.jsdelivr.net/npm/glossaire_auto/dist/glossaire_eau.js" defer></script>
```

# Procédure compilation (build)

Le plugin peut être compilé avec NPM. Si vous ne l'avez déjà fait, installez ce dernier, vous trouverez les instructions sur cette page : [https://www.npmjs.com/get-npm](https://www.npmjs.com/get-npm)

Une fois NPM installé, exécutez les commandes suivantes :

```
npm install
npm run build
```

Cette commande compile le projet dans un seul fichier Javascript (`glossaire_eau.js`), qui est appelé par le navigateur client pour afficher les définitions.

# Crédits

Copyright (C) 2019-2024 OIEau

Le logiciel est distribué sous la licence [CC BY 3.0 FR](https://creativecommons.org/share-your-work/cclicenses/).
