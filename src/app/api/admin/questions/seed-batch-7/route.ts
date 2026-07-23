import { successResponse, errorResponse, authenticateAdmin } from '../../../_lib/helpers';
import { getPool } from '../../../_lib/db';

type Q = [string, string, string, number, string];

const QUESTIONS: Q[] = [
  // ===================== MATHÉMATIQUES (110 questions) =====================

  // --- Algèbre abstraite & Algèbre avancée ---
  ['Mathématiques', 'En algèbre abstraite, quel est l\'ordre du groupe symétrique S₃ (groupe des permutations de 3 éléments) ?', '["3", "4", "6", "8"]', 2, 'hard'],
  ['Mathématiques', 'Quel mathématicien français, mort en duel à l\'âge de 20 ans, a fondé la théorie des groupes ?', '["Augustin-Louis Cauchy", "Évariste Galois", "Joseph-Louis Lagrange", "Adrien-Marie Legendre"]', 1, 'hard'],
  ['Mathématiques', 'Quel est le degré du polynôme minimal de √2 sur le corps ℚ des rationnels ?', '["1", "2", "3", "4"]', 1, 'hard'],
  ['Mathématiques', 'En théorie des anneaux, comment appelle-t-on un anneau commutatif intègre dans lequel tout idéal est principal ?', '["Anneau euclidien", "Anneau principal", "Anneau factoriel", "Corps"]', 1, 'hard'],
  ['Mathématiques', 'Quelle est la caractéristique du corps fini 𝔽₅ = ℤ/5ℤ ?', '["0", "1", "2", "5"]', 3, 'hard'],
  ['Mathématiques', 'Quel théorème fondamental de l\'algèbre affirme que tout polynôme de degré n à coefficients complexes admet exactement n racines comptées avec multiplicité ?', '["Théorème de Bézout", "Théorème de d\'Alembert-Gauss", "Théorème de Viète", "Théorème de Ruffini"]', 1, 'hard'],

  // --- Géométrie avancée ---
  ['Mathématiques', 'Quel mathématicien russe a publié en 1829 les premiers travaux sur la géométrie non euclidienne ?', '["Bernhard Riemann", "Nikolaï Lobatchevski", "János Bolyai", "Felix Klein"]', 1, 'hard'],
  ['Mathématiques', 'Quelle est la valeur de la caractéristique d\'Euler (V − A + F) pour tout polyèdre convexe ?', '["0", "1", "2", "4"]', 2, 'hard'],
  ['Mathématiques', 'En géométrie hyperbolique, quelle propriété a la somme des angles d\'un triangle ?', '["Elle est exactement égale à 180°", "Elle est strictement supérieure à 180°", "Elle est strictement inférieure à 180°", "Elle varie mais vaut 180° en moyenne"]', 2, 'hard'],
  ['Mathématiques', 'Quel solide de Platon possède exactement 4 faces triangulaires équilatérales ?', '["Tétraèdre", "Octaèdre", "Cube", "Icosaèdre"]', 0, 'easy'],
  ['Mathématiques', 'Quelle transformation géométrique conserve les distances et les angles mais inverse l\'orientation ?', '["Rotation", "Translation", "Symétrie axiale (réflexion)", "Homothétie"]', 2, 'hard'],
  ['Mathématiques', 'Quel mathématicien grec a écrit les « Éléments », ouvrage fondateur de la géométrie ?', '["Archimède", "Euclide", "Thalès", "Pythagore"]', 1, 'easy'],

  // --- Trigonométrie ---
  ['Mathématiques', 'Quelle est la période de la fonction tangente tan(x) ?', '["π/2", "π", "2π", "4π"]', 1, 'hard'],
  ['Mathématiques', 'Quelle identité trigonométrique exprime sin(2x) ?', '["sin²(x) + cos²(x)", "2 sin(x) cos(x)", "cos²(x) − sin²(x)", "sin(x) + cos(x)"]', 1, 'medium'],
  ['Mathématiques', 'Quelle est la valeur de tan(45°) ?', '["0", "1/2", "1", "√3"]', 2, 'easy'],
  ['Mathématiques', 'Quelle loi de trigonométrie relie les côtés d\'un triangle quelconque à ses angles par la relation a/sin(A) = b/sin(B) = c/sin(C) ?', '["Loi des cosinus", "Loi des sinus", "Loi des tangentes", "Théorème de Stewart"]', 1, 'medium'],
  ['Mathématiques', 'Quelle est la dérivée de la fonction arctan(x) ?', '["1/√(1 − x²)", "1/(1 + x²)", "−1/√(1 − x²)", "1/x"]', 1, 'hard'],

  // --- Analyse et Calcul ---
  ['Mathématiques', 'Quel est le développement en série de Taylor de eˣ autour de x = 0 ?', '["Σ xⁿ", "Σ xⁿ/n!", "Σ n·xⁿ", "Σ xⁿ/n"]', 1, 'hard'],
  ['Mathématiques', 'Quelle est la dérivée de ln(x) ?', '["x", "1/x", "ln(x)/x", "eˣ"]', 1, 'easy'],
  ['Mathématiques', 'Quel théorème du calcul intégral affirme que la dérivation et l\'intégration sont des opérations inverses ?', '["Théorème de Rolle", "Théorème des valeurs intermédiaires", "Théorème fondamental de l\'analyse", "Théorème de la moyenne"]', 2, 'medium'],
  ['Mathématiques', 'Quelle est la valeur de l\'intégrale définie ∫₀ᵖⁱ sin(x) dx ?', '["0", "1", "2", "π"]', 2, 'hard'],
  ['Mathématiques', 'Quel type d\'équation différentielle a la forme y\' + P(x)·y = Q(x) ?', '["Équation de Bernoulli", "Équation linéaire du premier ordre", "Équation de Riccati", "Équation à variables séparables"]', 1, 'hard'],
  ['Mathématiques', 'Quelle méthode numérique permet d\'approximer la valeur d\'une intégrale définie en utilisant des trapèzes ?', '["Méthode de Simpson", "Méthode des trapèzes", "Méthode de Monte-Carlo", "Méthode de Newton"]', 1, 'hard'],
  ['Mathématiques', 'Quel est le développement limité de cos(x) à l\'ordre 4 autour de 0 ?', '["1 − x²/2 + x⁴/24", "1 + x²/2 + x⁴/24", "x − x³/6 + x⁵/120", "1 − x + x²/2"]', 0, 'hard'],
  ['Mathématiques', 'Quelle est la divergence du champ vectoriel F = (x², y², z²) ?', '["x² + y² + z²", "2x + 2y + 2z", "6", "2xyz"]', 1, 'hard'],

  // --- Théorie des nombres ---
  ['Mathématiques', 'Quel théorème affirme que aᵖ ≡ a (mod p) pour tout entier a et tout nombre premier p ?', '["Théorème d\'Euler", "Petit théorème de Fermat", "Théorème de Wilson", "Théorème chinois des restes"]', 1, 'hard'],
  ['Mathématiques', 'Quel théorème permet de résoudre un système de congruences simultanées avec des modules premiers entre eux ?', '["Théorème de Wilson", "Théorème chinois des restes", "Théorème d\'Euler", "Petit théorème de Fermat"]', 1, 'hard'],
  ['Mathématiques', 'Combien de paires de nombres premiers jumeaux (différant de 2) existe-t-il entre 1 et 50 ?', '["4", "5", "6", "8"]', 2, 'hard'],
  ['Mathématiques', 'Quel mathématicien de l\'Antiquité a démontré qu\'il existe une infinité de nombres premiers ?', '["Euler", "Euclide", "Gauss", "Fermat"]', 1, 'hard'],
  ['Mathématiques', 'Quelle fonction arithmétique, notée φ(n), compte le nombre d\'entiers de 1 à n qui sont premiers avec n ?', '["Fonction de Möbius", "Indicatrice d\'Euler", "Fonction sigma", "Fonction de Liouville"]', 1, 'hard'],
  ['Mathématiques', 'Quelle est la valeur de l\'indicatrice d\'Euler φ(12) ?', '["2", "4", "6", "8"]', 1, 'hard'],
  ['Mathématiques', 'Quel est le plus petit nombre parfait, c\'est-à-dire égal à la somme de ses diviseurs propres ?', '["4", "6", "8", "12"]', 1, 'medium'],
  ['Mathématiques', 'Combien de diviseurs positifs possède le nombre 360 ?', '["18", "20", "24", "30"]', 2, 'hard'],

  // --- Statistiques et Probabilités ---
  ['Mathématiques', 'Quel théorème fondamental affirme que la moyenne d\'un grand nombre de variables aléatoires indépendantes suit approximativement une loi normale ?', '["Loi des grands nombres", "Théorème central limite", "Théorème de Bayes", "Inégalité de Markov"]', 1, 'medium'],
  ['Mathématiques', 'Quelle formule permet de calculer la probabilité conditionnelle P(A|B) en fonction de P(B|A), P(A) et P(B) ?', '["Formule des probabilités totales", "Théorème de Bayes", "Formule d\'inclusion-exclusion", "Chaîne de Markov"]', 1, 'medium'],
  ['Mathématiques', 'Quelle mesure statistique indique la dispersion des données autour de la moyenne ?', '["Médiane", "Mode", "Écart-type", "Quartile"]', 2, 'easy'],
  ['Mathématiques', 'Dans une distribution normale standard, quel pourcentage approximatif des données se situe à moins d\'un écart-type de la moyenne ?', '["50 %", "68 %", "95 %", "99,7 %"]', 1, 'medium'],
  ['Mathématiques', 'Quelle loi de probabilité modélise le nombre de succès dans n épreuves de Bernoulli indépendantes ?', '["Loi de Poisson", "Loi binomiale", "Loi normale", "Loi géométrique"]', 1, 'medium'],
  ['Mathématiques', 'Quel est le coefficient de corrélation de Pearson pour deux variables parfaitement corrélées positivement ?', '["0", "0,5", "1", "2"]', 2, 'medium'],
  ['Mathématiques', 'Quelle est l\'espérance mathématique du résultat d\'un lancer de dé à 6 faces équilibré ?', '["3", "3,5", "4", "4,5"]', 1, 'easy'],

  // --- Mathématiciens célèbres ---
  ['Mathématiques', 'Quelle mathématicienne allemande est considérée comme la fondatrice de l\'algèbre abstraite moderne et a donné son nom à un théorème fondamental en physique ?', '["Sophie Germain", "Emmy Noether", "Ada Lovelace", "Maryam Mirzakhani"]', 1, 'hard'],
  ['Mathématiques', 'Quel mathématicien a formulé 23 problèmes célèbres lors du Congrès international des mathématiciens de 1900 ?', '["Henri Poincaré", "David Hilbert", "Felix Klein", "Hermann Minkowski"]', 1, 'hard'],
  ['Mathématiques', 'Quel mathématicien norvégien a prouvé l\'impossibilité de résoudre par radicaux l\'équation générale de degré 5 ?', '["Niels Henrik Abel", "Évariste Galois", "Carl Jacobi", "Sophus Lie"]', 0, 'hard'],
  ['Mathématiques', 'Quel mathématicien a introduit la notion d\'ensemble infini et prouvé que l\'ensemble des réels est indénombrable ?', '["Richard Dedekind", "Georg Cantor", "Ernst Zermelo", "Gottlob Frege"]', 1, 'hard'],
  ['Mathématiques', 'Quel mathématicien persan du IXe siècle a donné son nom à l\'algèbre (al-jabr) ?', '["Al-Kindi", "Al-Khwarizmi", "Omar Khayyam", "Ibn al-Haytham"]', 1, 'hard'],
  ['Mathématiques', 'Quel mathématicien français a fondé la théorie des probabilités avec Blaise Pascal en 1654 ?', '["René Descartes", "Pierre de Fermat", "Pierre-Simon Laplace", "Joseph-Louis Lagrange"]', 1, 'hard'],
  ['Mathématiques', 'Quel mathématicien britannique est considéré comme le père de l\'informatique théorique grâce à sa machine abstraite ?', '["John von Neumann", "Alan Turing", "Charles Babbage", "Claude Shannon"]', 1, 'easy'],
  ['Mathématiques', 'Quelle mathématicienne française du XVIIIe siècle a travaillé sur la théorie de l\'élasticité et les nombres premiers sous le pseudonyme de M. LeBlanc ?', '["Émilie du Châtelet", "Sophie Germain", "Maria Gaetana Agnesi", "Ada Lovelace"]', 1, 'medium'],

  // --- Constantes et théorèmes fondamentaux ---
  ['Mathématiques', 'Quelle identité célèbre d\'Euler relie les cinq constantes fondamentales e, i, π, 1 et 0 ?', '["e^(iπ) = 1", "e^(iπ) + 1 = 0", "e^(iπ) − 1 = 0", "e^(iπ) = −i"]', 1, 'hard'],
  ['Mathématiques', 'Quelle constante mathématique, notée γ, est définie comme la limite de (1 + 1/2 + ... + 1/n − ln n) quand n tend vers l\'infini ?', '["Constante de Planck", "Constante d\'Euler-Mascheroni", "Constante de Khintchine", "Constante d\'Apéry"]', 1, 'hard'],
  ['Mathématiques', 'Quel théorème d\'analyse complexe affirme que l\'intégrale d\'une fonction holomorphe le long d\'un contour fermé dans un domaine simplement connexe est nulle ?', '["Théorème des résidus", "Théorème intégral de Cauchy", "Théorème de Morera", "Théorème de Liouville"]', 1, 'hard'],
  ['Mathématiques', 'Quel théorème affirme que toute application continue d\'un disque fermé dans lui-même admet au moins un point fixe ?', '["Théorème de Banach", "Théorème de Schauder", "Théorème du point fixe de Brouwer", "Théorème de Kakutani"]', 2, 'hard'],
  ['Mathématiques', 'Quelle est la valeur approchée de la constante d\'Euler-Mascheroni γ ?', '["0,3679", "0,5772", "0,6931", "0,7854"]', 1, 'hard'],

  // --- Théorie des ensembles et Logique ---
  ['Mathématiques', 'Quel axiome controversé de la théorie des ensembles permet de choisir un élément dans chaque ensemble d\'une famille non vide d\'ensembles ?', '["Axiome de l\'infini", "Axiome du choix", "Axiome de régularité", "Axiome de remplacement"]', 1, 'hard'],
  ['Mathématiques', 'Quel paradoxe logique, formulé par Bertrand Russell, concerne l\'ensemble de tous les ensembles qui ne se contiennent pas eux-mêmes ?', '["Paradoxe du menteur", "Paradoxe de Russell", "Paradoxe de Banach-Tarski", "Paradoxe de Zénon"]', 1, 'hard'],
  ['Mathématiques', 'Comment appelle-t-on le cardinal de l\'ensemble des nombres réels, noté 𝔠 ou 2^ℵ₀ ?', '["Aleph-zéro", "Aleph-un", "Puissance du continu", "Beth-un"]', 2, 'hard'],
  ['Mathématiques', 'Quelle hypothèse de Cantor, indécidable dans ZFC, affirme qu\'il n\'existe pas de cardinal strictement compris entre ℵ₀ et 2^ℵ₀ ?', '["Hypothèse de Riemann", "Hypothèse du continu", "Hypothèse de Goldbach", "Hypothèse de Collatz"]', 1, 'hard'],
  ['Mathématiques', 'En logique propositionnelle, quelle est la valeur de vérité de l\'implication « FAUX ⟹ VRAI » ?', '["VRAI", "FAUX", "Indéterminé", "Contradiction"]', 0, 'medium'],
  ['Mathématiques', 'Quel logicien américain a prouvé en 1963 l\'indépendance de l\'hypothèse du continu par rapport aux axiomes ZFC ?', '["Kurt Gödel", "Paul Cohen", "Ernst Zermelo", "Abraham Fraenkel"]', 1, 'hard'],

  // --- Combinatoire ---
  ['Mathématiques', 'De combien de façons peut-on répartir 10 boules identiques dans 3 urnes distinctes ?', '["36", "56", "66", "120"]', 2, 'hard'],
  ['Mathématiques', 'Quel est le quatrième nombre de Catalan C₄ (la suite commençant par C₀ = 1, C₁ = 1, C₂ = 2, C₃ = 5) ?', '["5", "14", "42", "132"]', 1, 'hard'],
  ['Mathématiques', 'Combien de permutations circulaires distinctes peut-on former avec 6 personnes autour d\'une table ronde ?', '["60", "120", "360", "720"]', 1, 'hard'],
  ['Mathématiques', 'Quel principe affirme que si n + 1 objets sont placés dans n tiroirs, au moins un tiroir contient au moins 2 objets ?', '["Principe d\'inclusion-exclusion", "Principe des tiroirs (pigeonhole)", "Principe de récurrence", "Principe du maximum"]', 1, 'medium'],

  // --- Suites et Séries ---
  ['Mathématiques', 'Quelle série divergente est définie par la somme 1 + 1/2 + 1/3 + 1/4 + ... ?', '["Série de Fibonacci", "Série géométrique", "Série harmonique", "Série de Dirichlet"]', 2, 'medium'],
  ['Mathématiques', 'Quel critère de convergence compare une série à termes positifs à une intégrale impropre ?', '["Critère de d\'Alembert (rapport)", "Critère de comparaison par intégrale", "Critère de Cauchy (racine)", "Critère de Leibniz"]', 1, 'hard'],
  ['Mathématiques', 'Quelle est la valeur de la somme de la série 1 + 1/4 + 1/9 + 1/16 + ... (somme des inverses des carrés), résolue par Euler en 1735 ?', '["π/4", "π²/6", "π²/12", "ln(2)"]', 1, 'hard'],
  ['Mathématiques', 'Quel est le rayon de convergence de la série entière Σ xⁿ/n! ?', '["0", "1", "e", "+∞"]', 3, 'hard'],

  // --- Matrices et Algèbre linéaire ---
  ['Mathématiques', 'Combien de valeurs propres (comptées avec multiplicité) possède une matrice carrée de taille n × n ?', '["n − 1", "n", "n + 1", "2n"]', 1, 'medium'],
  ['Mathématiques', 'Quelle décomposition matricielle exprime une matrice comme le produit de trois matrices U·Σ·Vᵀ, où Σ est diagonale ?', '["Décomposition LU", "Décomposition QR", "Décomposition en valeurs singulières (SVD)", "Décomposition de Cholesky"]', 2, 'hard'],
  ['Mathématiques', 'Quel est le rang d\'une matrice 3 × 4 dont toutes les lignes sont proportionnelles entre elles ?', '["0", "1", "3", "4"]', 1, 'hard'],
  ['Mathématiques', 'Quelle propriété caractérise une matrice orthogonale A de taille n × n ?', '["A² = I", "A·Aᵀ = I", "A + Aᵀ = 0", "det(A) = 0"]', 1, 'hard'],
  ['Mathématiques', 'Quel théorème affirme que toute matrice carrée est racine de son propre polynôme caractéristique ?', '["Théorème spectral", "Théorème de Cayley-Hamilton", "Théorème de Sylvester", "Théorème de Jordan"]', 1, 'hard'],

  // --- Nombres complexes ---
  ['Mathématiques', 'Quelle est la forme exponentielle du nombre complexe 1 + i ?', '["e^(iπ/4)", "√2 · e^(iπ/4)", "2 · e^(iπ/4)", "√2 · e^(iπ/2)"]', 1, 'hard'],
  ['Mathématiques', 'Combien de racines cubiques complexes distinctes possède le nombre 1 ?', '["1", "2", "3", "6"]', 2, 'medium'],
  ['Mathématiques', 'Quel est le module du nombre complexe 3 + 4i ?', '["4", "5", "7", "25"]', 1, 'easy'],

  // --- Théorie des graphes ---
  ['Mathématiques', 'Quel est le nombre chromatique du graphe complet K₄ ?', '["2", "3", "4", "6"]', 2, 'hard'],
  ['Mathématiques', 'Quel célèbre théorème, démontré par ordinateur en 1976, affirme que quatre couleurs suffisent pour colorier toute carte plane ?', '["Théorème de Ramsey", "Théorème des quatre couleurs", "Théorème de Brooks", "Théorème de Vizing"]', 1, 'medium'],
  ['Mathématiques', 'Comment appelle-t-on un graphe connexe dans lequel il existe un circuit passant par chaque arête exactement une fois ?', '["Graphe hamiltonien", "Graphe eulérien", "Graphe planaire", "Graphe biparti"]', 1, 'medium'],
  ['Mathématiques', 'Combien d\'arêtes possède le graphe complet K₅ ?', '["5", "8", "10", "15"]', 2, 'hard'],
  ['Mathématiques', 'Quel théorème caractérise les graphes planaires par l\'absence de subdivision de K₅ ou de K₃,₃ ?', '["Théorème d\'Euler", "Théorème de Kuratowski", "Théorème de Ramsey", "Théorème de Menger"]', 1, 'hard'],

  // --- Fractales ---
  ['Mathématiques', 'Quel mathématicien franco-américain a inventé le terme « fractale » en 1975 ?', '["Georg Cantor", "Benoît Mandelbrot", "Gaston Julia", "Wacław Sierpiński"]', 1, 'hard'],
  ['Mathématiques', 'Quelle est la dimension fractale (dimension de Hausdorff) du triangle de Sierpiński ?', '["1", "log(3)/log(2) ≈ 1,585", "1,5", "2"]', 1, 'hard'],
  ['Mathématiques', 'Quel ensemble fractal est défini par l\'itération de z → z² + c dans le plan complexe ?', '["Ensemble de Julia", "Ensemble de Mandelbrot", "Ensemble de Cantor", "Courbe de Koch"]', 1, 'hard'],
  ['Mathématiques', 'Quelle est la dimension fractale de la courbe de Koch ?', '["1", "log(4)/log(3) ≈ 1,262", "1,5", "2"]', 1, 'hard'],

  // --- Théorie des jeux ---
  ['Mathématiques', 'Quel mathématicien a reçu le prix Nobel d\'économie en 1994 pour ses travaux sur la théorie des jeux ?', '["John von Neumann", "John Nash", "Lloyd Shapley", "Robert Aumann"]', 1, 'medium'],
  ['Mathématiques', 'Dans le dilemme du prisonnier, quelle est la stratégie dominante pour chaque joueur ?', '["Coopérer", "Trahir", "Alterner", "Coopérer puis trahir"]', 1, 'medium'],
  ['Mathématiques', 'Quel concept de théorie des jeux décrit un état où aucun joueur ne peut améliorer sa situation en changeant unilatéralement de stratégie ?', '["Optimum de Pareto", "Équilibre de Nash", "Point selle", "Stratégie maximin"]', 1, 'medium'],

  // --- Équations différentielles ---
  ['Mathématiques', 'Quelle est la solution générale de l\'équation différentielle y\' = ky ?', '["y = kx + C", "y = Ce^(kx)", "y = C·cos(kx)", "y = C·ln(kx)"]', 1, 'easy'],
  ['Mathématiques', 'Quel type d\'équation différentielle modélise un oscillateur harmonique simple ?', '["y\' + ky = 0", "y\'\' + ω²y = 0", "y\'\' − ω²y = 0", "y\' = ky(1 − y/K)"]', 1, 'hard'],
  ['Mathématiques', 'Quelle équation aux dérivées partielles décrit la diffusion de la chaleur dans un milieu ?', '["Équation de Laplace", "Équation de la chaleur", "Équation des ondes", "Équation de Schrödinger"]', 1, 'hard'],
  ['Mathématiques', 'Quel théorème fondamental garantit l\'existence et l\'unicité des solutions d\'une équation différentielle ordinaire sous des conditions de régularité ?', '["Théorème d\'Euler-Lagrange", "Théorème de Cauchy-Lipschitz", "Théorème de Riemann-Liouville", "Théorème de Fourier-Laplace"]', 1, 'hard'],

  // --- Médaille Fields et histoire des mathématiques ---
  ['Mathématiques', 'Quelle est la plus haute distinction en mathématiques, décernée tous les 4 ans aux mathématiciens de moins de 40 ans ?', '["Prix Abel", "Médaille Fields", "Prix Wolf", "Prix Breakthrough"]', 1, 'easy'],
  ['Mathématiques', 'Quelle mathématicienne iranienne a été la première femme à recevoir la médaille Fields en 2014 ?', '["Emmy Noether", "Sophie Germain", "Maryam Mirzakhani", "Karen Uhlenbeck"]', 2, 'hard'],
  ['Mathématiques', 'Quel mathématicien russe a refusé la médaille Fields en 2006 après avoir prouvé la conjecture de Poincaré ?', '["Vladimir Voevodsky", "Grigori Perelman", "Andreï Kolmogorov", "Andreï Markov"]', 1, 'hard'],
  ['Mathématiques', 'En quelle année la médaille Fields a-t-elle été décernée pour la première fois ?', '["1924", "1932", "1936", "1950"]', 2, 'hard'],
  ['Mathématiques', 'Quel mathématicien français a reçu la médaille Fields en 2010 pour ses travaux sur l\'équation de Boltzmann et le transport optimal ?', '["Jean-Pierre Serre", "Alain Connes", "Cédric Villani", "Laurent Lafforgue"]', 2, 'hard'],

  // --- Mathématiques en Afrique ---
  ['Mathématiques', 'Quel artefact préhistorique découvert au Congo, daté d\'environ 20 000 ans, est considéré comme l\'un des plus anciens instruments mathématiques ?', '["Tablette de Plimpton", "Os d\'Ishango", "Papyrus de Moscou", "Pierre de Rosette"]', 1, 'hard'],
  ['Mathématiques', 'Quel papyrus égyptien, copié par le scribe Ahmès vers 1550 av. J.-C., contient 87 problèmes mathématiques et est l\'un des plus anciens textes mathématiques connus ?', '["Papyrus Rhind", "Papyrus de Moscou", "Papyrus d\'Ebers", "Papyrus de Berlin"]', 0, 'hard'],
  ['Mathématiques', 'Quel système de numération non positionnel (additif) était utilisé par les anciens Égyptiens dans leur écriture hiéroglyphique ?', '["Système binaire", "Système décimal additif (hiéroglyphique)", "Système sexagésimal", "Système vigésimal"]', 1, 'hard'],
  ['Mathématiques', 'Quel système de numération en base 20 (vigésimal) était utilisé par le peuple yoruba au Nigeria ?', '["Système binaire", "Système décimal", "Système vigésimal (base 20)", "Système sexagésimal (base 60)"]', 2, 'hard'],

  // --- Mathématiques appliquées et Cryptographie ---
  ['Mathématiques', 'Quel algorithme de cryptographie à clé publique repose sur la difficulté de factoriser de grands nombres en produit de nombres premiers ?', '["AES", "RSA", "DES", "Blowfish"]', 1, 'hard'],
  ['Mathématiques', 'Quelle branche des mathématiques, utilisant les courbes elliptiques sur des corps finis, est à la base de protocoles cryptographiques modernes ?', '["Théorie des nombres algébriques", "Cryptographie sur courbes elliptiques (ECC)", "Théorie des codes", "Algèbre linéaire"]', 1, 'hard'],
  ['Mathématiques', 'Quel algorithme d\'optimisation linéaire, développé par George Dantzig en 1947, est largement utilisé en recherche opérationnelle ?', '["Algorithme de Newton", "Algorithme du simplexe", "Algorithme de Dijkstra", "Algorithme de gradient"]', 1, 'hard'],
  ['Mathématiques', 'Quelle transformée, définie par ℒ{f(t)} = ∫₀^∞ f(t)·e^(−st) dt, est utilisée pour résoudre les équations différentielles linéaires ?', '["Transformée de Fourier", "Transformée de Laplace", "Transformée en Z", "Transformée de Hilbert"]', 1, 'hard'],

  // --- Topologie, espaces et théorèmes avancés ---
  ['Mathématiques', 'Quelle conjecture en théorie des nombres affirme que la suite définie par n/2 (si n est pair) et 3n + 1 (si n est impair) atteint toujours 1 ?', '["Conjecture de Goldbach", "Conjecture de Collatz (Syracuse)", "Conjecture de Riemann", "Conjecture ABC"]', 1, 'medium'],
  ['Mathématiques', 'Quel espace mathématique, introduit par David Hilbert, généralise l\'espace euclidien à la dimension infinie avec un produit scalaire complet ?', '["Espace de Banach", "Espace de Hilbert", "Espace de Sobolev", "Espace de Fréchet"]', 1, 'hard'],
  ['Mathématiques', 'Quelle courbe, appelée brachistochrone, minimise le temps de descente d\'un point à un autre sous l\'effet de la gravité ?', '["Parabole", "Cycloïde", "Chaînette", "Spirale logarithmique"]', 1, 'hard'],
  ['Mathématiques', 'Quel problème classique d\'optimisation combinatoire consiste à trouver le chemin le plus court passant par toutes les villes exactement une fois ?', '["Problème de Königsberg", "Problème du voyageur de commerce", "Problème du sac à dos", "Problème des n reines"]', 1, 'medium'],
  ['Mathématiques', 'Quelle est la valeur de la fonction zêta de Riemann ζ(−1), qui donne formellement la « somme » 1 + 2 + 3 + ... par prolongement analytique ?', '["−1/12", "∞", "0", "1"]', 0, 'hard'],
  ['Mathématiques', 'Quel espace topologique est obtenu en identifiant les bords opposés d\'un carré avec un retournement, formant une surface non orientable sans bord ?', '["Tore", "Bouteille de Klein", "Plan projectif", "Ruban de Möbius"]', 1, 'hard'],
];

export async function POST(req: Request) {
  const admin = await authenticateAdmin(req);
  if (!admin) return errorResponse('Admin access required', 403);

  try {
    const pool = getPool();
    let added = 0, skipped = 0;

    for (const [catName, question, optionsJson, correctAnswer, difficulty] of QUESTIONS) {
      const catRes = await pool.query(
        `INSERT INTO categories (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
        [catName]
      );
      const categoryId = catRes.rows[0].id;

      const exists = await pool.query('SELECT id FROM questions WHERE question = $1 AND category_id = $2', [question, categoryId]);
      if (exists.rows.length > 0) { skipped++; continue; }

      await pool.query(
        'INSERT INTO questions (category_id, question, options, correct_answer, difficulty, is_active) VALUES ($1, $2, $3, $4, $5, TRUE)',
        [categoryId, question, optionsJson, correctAnswer, difficulty]
      );
      added++;
    }

    const totalRes = await pool.query('SELECT COUNT(*) as c FROM questions');
    const catCounts = await pool.query('SELECT c.name, COUNT(*) as total FROM questions q JOIN categories c ON q.category_id = c.id GROUP BY c.name ORDER BY c.name');

    return successResponse({
      message: `Batch 7: Added ${added} new questions, skipped ${skipped} duplicates`,
      total_questions: Number(totalRes.rows[0].c),
      categories: catCounts.rows,
    });
  } catch (err: any) {
    return errorResponse('Seed failed: ' + err.message, 500);
  }
}
