import { successResponse, errorResponse, authenticateAdmin } from '../../../_lib/helpers';
import { getPool } from '../../../_lib/db';

type Q = [string, string, string, number, string];

const QUESTIONS: Q[] = [
  // ===================== POLITIQUE MONDIALE (43 questions) =====================
  ['Politique Mondiale', 'Quel pays a exercé le droit de veto le plus souvent au Conseil de sécurité de l\'ONU depuis 1945 ?', '["États-Unis", "Russie/URSS", "Chine", "France"]', 1, 'hard'],
  ['Politique Mondiale', 'En quelle année le Traité de Maastricht, fondateur de l\'Union européenne, a-t-il été signé ?', '["1989", "1991", "1992", "1995"]', 2, 'hard'],
  ['Politique Mondiale', 'Quel organisme international a son siège à La Haye et juge les crimes de guerre ?', '["Cour internationale de Justice", "Cour pénale internationale", "Tribunal pénal international", "Conseil des droits de l\'homme"]', 1, 'hard'],
  ['Politique Mondiale', 'Quel accord de 1994 a créé l\'Accord de libre-échange nord-américain (ALENA) ?', '["Accord de Bretton Woods", "Accord de Marrakech", "Accord de libre-échange nord-américain", "Accord de Paris"]', 2, 'medium'],
  ['Politique Mondiale', 'Combien de membres permanents siègent au Conseil de sécurité de l\'ONU ?', '["3", "5", "7", "10"]', 1, 'medium'],
  ['Politique Mondiale', 'Quel traité de 1968 vise à empêcher la prolifération des armes nucléaires ?', '["Traité ABM", "Traité sur la non-prolifération (TNP)", "Traité SALT", "Traité START"]', 1, 'hard'],
  ['Politique Mondiale', 'Quel pays n\'est PAS membre fondateur des BRICS ?', '["Brésil", "Russie", "Afrique du Sud", "Inde"]', 2, 'hard'],
  ['Politique Mondiale', 'En quelle année le mur de Berlin est-il tombé ?', '["1987", "1988", "1989", "1991"]', 2, 'medium'],
  ['Politique Mondiale', 'Quel secrétaire général de l\'ONU d\'origine ghanéenne a reçu le prix Nobel de la paix en 2001 ?', '["Boutros Boutros-Ghali", "Kofi Annan", "Ban Ki-moon", "António Guterres"]', 1, 'hard'],
  ['Politique Mondiale', 'Quel traité de 2015 a engagé les nations à limiter le réchauffement climatique à 1,5°C ?', '["Protocole de Kyoto", "Accord de Copenhague", "Accord de Paris", "Convention de Rio"]', 2, 'medium'],
  ['Politique Mondiale', 'Quel conflit a opposé l\'Iran et l\'Irak de 1980 à 1988 ?', '["Guerre du Golfe", "Guerre Iran-Irak", "Guerre des Six Jours", "Guerre du Kippour"]', 1, 'hard'],
  ['Politique Mondiale', 'Quel pays a quitté l\'Union européenne en 2020 dans le cadre du Brexit ?', '["Norvège", "Suisse", "Royaume-Uni", "Islande"]', 2, 'easy'],
  ['Politique Mondiale', 'Quelle résolution de l\'ONU de 1948 a proclamé la Déclaration universelle des droits de l\'homme ?', '["Résolution 181", "Résolution 217", "Résolution 242", "Résolution 1325"]', 1, 'hard'],
  ['Politique Mondiale', 'Quel pays possède le plus grand arsenal nucléaire au monde en 2024 ?', '["États-Unis", "Russie", "Chine", "France"]', 1, 'hard'],
  ['Politique Mondiale', 'En quelle année l\'Organisation du Traité de l\'Atlantique Nord (OTAN) a-t-elle été fondée ?', '["1945", "1947", "1949", "1951"]', 2, 'hard'],
  ['Politique Mondiale', 'Quel accord de paix de 1998 a mis fin au conflit en Irlande du Nord ?', '["Accord de Camp David", "Accord du Vendredi saint", "Accord de Dayton", "Accord d\'Oslo"]', 1, 'hard'],
  ['Politique Mondiale', 'Quelle organisation internationale régit le commerce mondial depuis 1995 ?', '["FMI", "Banque mondiale", "OMC", "OCDE"]', 2, 'medium'],
  ['Politique Mondiale', 'Quel pays a annexé la Crimée en 2014 ?', '["États-Unis", "Chine", "Russie", "Turquie"]', 2, 'medium'],
  ['Politique Mondiale', 'Quel dirigeant soviétique a lancé les réformes de la glasnost et de la perestroïka ?', '["Brejnev", "Andropov", "Gorbatchev", "Eltsine"]', 2, 'hard'],
  ['Politique Mondiale', 'Quel pays africain a été le premier à obtenir son indépendance en 1847 ?', '["Ghana", "Éthiopie", "Liberia", "Égypte"]', 2, 'hard'],
  ['Politique Mondiale', 'Quel tribunal international a jugé les responsables du génocide rwandais de 1994 ?', '["CPI", "TPIR", "CIJ", "TPIY"]', 1, 'hard'],
  ['Politique Mondiale', 'Quel pays n\'est PAS membre permanent du Conseil de sécurité de l\'ONU ?', '["France", "Allemagne", "Chine", "Royaume-Uni"]', 1, 'medium'],
  ['Politique Mondiale', 'Quel accord de paix de 1993 a marqué un tournant dans le conflit israélo-palestinien ?', '["Accords de Camp David", "Accords d\'Oslo", "Accords de Madrid", "Accords de Genève"]', 1, 'hard'],
  ['Politique Mondiale', 'En quelle année l\'Union soviétique s\'est-elle officiellement dissoute ?', '["1989", "1990", "1991", "1993"]', 2, 'hard'],
  ['Politique Mondiale', 'Quel pays a le plus grand nombre de sièges à l\'Assemblée générale de l\'ONU ?', '["Chaque pays a un siège", "États-Unis en ont 5", "La Chine en a 3", "La Russie en a 2"]', 0, 'hard'],
  ['Politique Mondiale', 'Quelle institution de Bretton Woods finance les projets de développement dans les pays pauvres ?', '["FMI", "Banque mondiale", "OMC", "OIT"]', 1, 'hard'],
  ['Politique Mondiale', 'Quel traité de 1648 a établi le principe de souveraineté des États en Europe ?', '["Traité de Versailles", "Traité de Westphalie", "Traité de Vienne", "Traité de Tordesillas"]', 1, 'hard'],
  ['Politique Mondiale', 'Quelle guerre froide a divisé la Corée en deux États en 1953 ?', '["Guerre de Corée", "Guerre du Vietnam", "Guerre sino-japonaise", "Guerre civile chinoise"]', 0, 'hard'],
  ['Politique Mondiale', 'Quel pays a rejoint l\'OTAN en 2023 après l\'invasion russe de l\'Ukraine ?', '["Suède", "Finlande", "Géorgie", "Ukraine"]', 1, 'hard'],
  ['Politique Mondiale', 'Quel principe du droit international interdit l\'usage de la force entre États ?', '["Jus cogens", "Article 2(4) de la Charte de l\'ONU", "Responsabilité de protéger", "Droit d\'ingérence"]', 1, 'hard'],
  ['Politique Mondiale', 'Quel sommet de 1955 a réuni les pays non-alignés à Bandung en Indonésie ?', '["Conférence de Yalta", "Conférence de Bandung", "Conférence de San Francisco", "Conférence de Potsdam"]', 1, 'hard'],
  ['Politique Mondiale', 'Quelle doctrine américaine de 1947 visait à contenir l\'expansion du communisme ?', '["Doctrine Monroe", "Doctrine Truman", "Doctrine Eisenhower", "Doctrine Nixon"]', 1, 'hard'],
  ['Politique Mondiale', 'Quel organisme de l\'ONU est chargé de maintenir la paix et la sécurité internationales ?', '["Assemblée générale", "Conseil de sécurité", "Conseil économique et social", "Secrétariat"]', 1, 'medium'],
  ['Politique Mondiale', 'Quel pays a été le premier à reconnaître la République populaire de Chine en 1950 parmi les grandes puissances occidentales ?', '["États-Unis", "France", "Royaume-Uni", "Allemagne"]', 2, 'hard'],
  ['Politique Mondiale', 'Quelle crise de 1962 a failli déclencher une guerre nucléaire entre les États-Unis et l\'URSS ?', '["Crise de Suez", "Crise de Berlin", "Crise des missiles de Cuba", "Crise du canal de Panama"]', 2, 'hard'],
  ['Politique Mondiale', 'Quel pays détient le plus long différend territorial non résolu avec la Chine ?', '["Japon", "Inde", "Vietnam", "Taïwan"]', 1, 'hard'],
  ['Politique Mondiale', 'Quel traité de 2017 interdit les armes nucléaires mais n\'a pas été signé par les puissances nucléaires ?', '["Traité START", "Traité INF", "Traité sur l\'interdiction des armes nucléaires (TIAN)", "Traité CTBT"]', 2, 'hard'],
  ['Politique Mondiale', 'Quelle organisation régionale africaine a été fondée en 2002 pour remplacer l\'OUA ?', '["CEDEAO", "Union africaine", "SADC", "IGAD"]', 1, 'hard'],
  ['Politique Mondiale', 'Quel plan américain a financé la reconstruction de l\'Europe après la Seconde Guerre mondiale ?', '["Plan Marshall", "Plan Dawes", "Plan Young", "Plan Morgenthau"]', 0, 'medium'],
  ['Politique Mondiale', 'Quel pays a présidé le premier sommet des BRICS en 2009 ?', '["Brésil", "Russie", "Inde", "Chine"]', 1, 'hard'],
  ['Politique Mondiale', 'Quelle convention de 1951 définit le statut des réfugiés en droit international ?', '["Convention de Vienne", "Convention de Genève relative aux réfugiés", "Convention de La Haye", "Convention de Montréal"]', 1, 'hard'],
  ['Politique Mondiale', 'Quel organe judiciaire principal de l\'ONU siège au Palais de la Paix à La Haye ?', '["Cour pénale internationale", "Cour internationale de Justice", "Tribunal international du droit de la mer", "Cour européenne des droits de l\'homme"]', 1, 'hard'],
  ['Politique Mondiale', 'Quel embargo pétrolier de 1973 a provoqué le premier choc pétrolier mondial ?', '["Embargo de l\'OPEP", "Embargo de l\'Iran", "Embargo de l\'Irak", "Embargo de la Libye"]', 0, 'hard'],

  // ===================== MATHÉMATIQUES (43 questions) =====================
  ['Mathématiques', 'Quel mathématicien a démontré l\'incomplétude des systèmes formels en 1931 ?', '["Alan Turing", "Kurt Gödel", "David Hilbert", "Bertrand Russell"]', 1, 'hard'],
  ['Mathématiques', 'Quelle est la valeur de la constante d\'Euler (e) arrondie à 4 décimales ?', '["2,6183", "2,7183", "2,8183", "3,1416"]', 1, 'hard'],
  ['Mathématiques', 'Quel est le plus petit nombre premier supérieur à 100 ?', '["101", "103", "107", "109"]', 0, 'hard'],
  ['Mathématiques', 'Combien de faces possède un icosaèdre régulier ?', '["10", "12", "20", "24"]', 2, 'hard'],
  ['Mathématiques', 'Quel mathématicien a formulé le dernier théorème qui n\'a été prouvé qu\'en 1995 ?', '["Euler", "Gauss", "Fermat", "Riemann"]', 2, 'hard'],
  ['Mathématiques', 'Quelle est la somme des angles intérieurs d\'un hexagone ?', '["540°", "720°", "900°", "1080°"]', 1, 'hard'],
  ['Mathématiques', 'Quel est le résultat de la factorielle de 0 (0!) ?', '["0", "1", "Indéfini", "Infini"]', 1, 'medium'],
  ['Mathématiques', 'Quel mathématicien indien autodidacte a collaboré avec G.H. Hardy au début du XXe siècle ?', '["Aryabhata", "Brahmagupta", "Srinivasa Ramanujan", "C.V. Raman"]', 2, 'hard'],
  ['Mathématiques', 'Quelle est la dérivée de sin(x) ?', '["cos(x)", "-cos(x)", "sin(x)", "-sin(x)"]', 0, 'medium'],
  ['Mathématiques', 'Quel est le nom du problème du millénaire lié à la distribution des nombres premiers ?', '["Conjecture de Goldbach", "Hypothèse de Riemann", "Conjecture de Poincaré", "Problème P vs NP"]', 1, 'hard'],
  ['Mathématiques', 'Quelle est l\'intégrale de 1/x ?', '["x", "ln|x| + C", "1/x² + C", "e^x + C"]', 1, 'hard'],
  ['Mathématiques', 'Combien d\'arêtes possède un cube ?', '["8", "10", "12", "14"]', 2, 'medium'],
  ['Mathématiques', 'Quel théorème affirme que tout entier supérieur à 1 se décompose de manière unique en facteurs premiers ?', '["Théorème de Pythagore", "Théorème fondamental de l\'arithmétique", "Théorème de Fermat", "Théorème d\'Euler"]', 1, 'hard'],
  ['Mathématiques', 'Quelle est la valeur du nombre d\'or (phi) arrondie à 3 décimales ?', '["1,414", "1,618", "1,732", "2,236"]', 1, 'hard'],
  ['Mathématiques', 'Quel mathématicien a inventé la géométrie analytique en reliant algèbre et géométrie ?', '["Euclide", "Descartes", "Pascal", "Leibniz"]', 1, 'hard'],
  ['Mathématiques', 'Quelle est la formule de l\'aire d\'un triangle en fonction de sa base b et sa hauteur h ?', '["b × h", "b × h / 2", "2 × b × h", "b² × h"]', 1, 'easy'],
  ['Mathématiques', 'Quel est le nombre de diagonales dans un décagone (polygone à 10 côtés) ?', '["25", "30", "35", "40"]', 2, 'hard'],
  ['Mathématiques', 'Quel mathématicien allemand est considéré comme le « prince des mathématiciens » ?', '["Euler", "Gauss", "Riemann", "Hilbert"]', 1, 'hard'],
  ['Mathématiques', 'Quelle est la limite de (1 + 1/n)^n quand n tend vers l\'infini ?', '["1", "2", "e", "π"]', 2, 'hard'],
  ['Mathématiques', 'Quel type de nombre ne peut pas s\'exprimer comme un rapport de deux entiers ?', '["Nombre rationnel", "Nombre entier", "Nombre irrationnel", "Nombre naturel"]', 2, 'medium'],
  ['Mathématiques', 'Quelle est la somme des 100 premiers entiers naturels (1 + 2 + ... + 100) ?', '["4950", "5000", "5050", "5100"]', 2, 'hard'],
  ['Mathématiques', 'Quel mathématicien a développé le calcul infinitésimal indépendamment de Newton ?', '["Euler", "Leibniz", "Bernoulli", "Laplace"]', 1, 'hard'],
  ['Mathématiques', 'Quelle est la formule du volume d\'une sphère de rayon r ?', '["πr²", "2πr", "4πr²", "4/3 πr³"]', 3, 'hard'],
  ['Mathématiques', 'Quel nombre est à la fois carré parfait et cube parfait et est compris entre 60 et 70 ?', '["62", "63", "64", "66"]', 2, 'hard'],
  ['Mathématiques', 'Quelle branche des mathématiques étudie les propriétés des figures qui restent invariantes par déformation continue ?', '["Algèbre", "Topologie", "Analyse", "Combinatoire"]', 1, 'hard'],
  ['Mathématiques', 'Quel est le déterminant d\'une matrice 2×2 [[a, b], [c, d]] ?', '["a+d-b-c", "ad - bc", "ac - bd", "ab - cd"]', 1, 'hard'],
  ['Mathématiques', 'Combien de sommets possède un dodécaèdre régulier ?', '["10", "12", "20", "30"]', 2, 'hard'],
  ['Mathématiques', 'Quel est le PGCD de 252 et 198 ?', '["6", "9", "18", "36"]', 2, 'hard'],
  ['Mathématiques', 'Quelle distribution statistique est aussi appelée « courbe en cloche » ?', '["Distribution de Poisson", "Distribution binomiale", "Distribution normale (gaussienne)", "Distribution uniforme"]', 2, 'medium'],
  ['Mathématiques', 'Quel théorème relie la longueur des côtés d\'un triangle rectangle ?', '["Théorème de Thalès", "Théorème de Pythagore", "Théorème d\'Euclide", "Théorème de Fermat"]', 1, 'easy'],
  ['Mathématiques', 'Quelle est la valeur de π arrondie à 5 décimales ?', '["3,14156", "3,14159", "3,14162", "3,14169"]', 1, 'hard'],
  ['Mathématiques', 'Quel mathématicien a prouvé le dernier théorème de Fermat en 1995 ?', '["Grigori Perelman", "Andrew Wiles", "Terence Tao", "Jean-Pierre Serre"]', 1, 'hard'],
  ['Mathématiques', 'Quelle est la formule de la distance entre deux points (x1,y1) et (x2,y2) dans le plan ?', '["|x2-x1| + |y2-y1|", "√((x2-x1)² + (y2-y1)²)", "(x2-x1)² + (y2-y1)²", "√(|x2-x1| + |y2-y1|)"]', 1, 'medium'],
  ['Mathématiques', 'Quel est le plus grand nombre premier de Mersenne connu avant 2020 ayant la forme 2^p - 1 ?', '["2^61 - 1", "2^89 - 1", "2^82589933 - 1", "2^127 - 1"]', 2, 'hard'],
  ['Mathématiques', 'Quelle est la transformée de Fourier principalement utilisée pour analyser ?', '["Les matrices", "Les signaux périodiques et fréquences", "Les nombres premiers", "Les équations différentielles"]', 1, 'hard'],
  ['Mathématiques', 'Quel est le nombre de façons d\'arranger 5 objets distincts en ligne (5!) ?', '["24", "60", "120", "720"]', 2, 'medium'],
  ['Mathématiques', 'Quelle conjecture non prouvée affirme que tout nombre pair supérieur à 2 est la somme de deux nombres premiers ?', '["Conjecture de Riemann", "Conjecture de Goldbach", "Conjecture de Collatz", "Conjecture de twin primes"]', 1, 'hard'],
  ['Mathématiques', 'Quel est le résultat de log₁₀(1000) ?', '["2", "3", "4", "10"]', 1, 'medium'],
  ['Mathématiques', 'Quelle est la formule de la somme d\'une série géométrique infinie de raison |r| < 1 ?', '["a/(1+r)", "a/(1-r)", "a×r/(1-r)", "a/(r-1)"]', 1, 'hard'],
  ['Mathématiques', 'Quel mathématicien suisse a introduit la notation f(x) pour les fonctions ?', '["Gauss", "Euler", "Lagrange", "Cauchy"]', 1, 'hard'],
  ['Mathématiques', 'Quelle est la valeur de cos(60°) ?', '["0", "1/2", "√2/2", "√3/2"]', 1, 'hard'],
  ['Mathématiques', 'Quel espace vectoriel a une dimension infinie parmi les suivants ?', '["ℝ²", "ℝ³", "L\'espace des polynômes de degré ≤ 5", "L\'espace des polynômes"]', 3, 'hard'],
  ['Mathématiques', 'Quelle inégalité fondamentale en analyse relie l\'intégrale d\'un produit aux intégrales des carrés ?', '["Inégalité de Markov", "Inégalité de Cauchy-Schwarz", "Inégalité de Tchebychev", "Inégalité de Jensen"]', 1, 'hard'],

  // ===================== TECHNOLOGIE (43 questions) =====================
  ['Technologie', 'En quelle année le World Wide Web a-t-il été inventé par Tim Berners-Lee ?', '["1985", "1989", "1993", "1995"]', 1, 'hard'],
  ['Technologie', 'Quel langage de programmation a été créé par Guido van Rossum en 1991 ?', '["Java", "Ruby", "Python", "Perl"]', 2, 'medium'],
  ['Technologie', 'Quel algorithme de chiffrement est utilisé par le protocole HTTPS pour sécuriser les communications ?', '["MD5", "SHA-1", "TLS/SSL", "WEP"]', 2, 'hard'],
  ['Technologie', 'Quel est le nom du premier ordinateur électronique programmable à usage général, opérationnel en 1945 ?', '["UNIVAC", "ENIAC", "Colossus", "Z3"]', 1, 'hard'],
  ['Technologie', 'Quel protocole de communication est utilisé pour envoyer des courriels ?', '["HTTP", "FTP", "SMTP", "TCP"]', 2, 'medium'],
  ['Technologie', 'Quelle entreprise a développé le système d\'exploitation Android ?', '["Apple", "Microsoft", "Google", "Samsung"]', 2, 'easy'],
  ['Technologie', 'Quel concept en informatique décrit un programme qui s\'appelle lui-même ?', '["Itération", "Récursion", "Polymorphisme", "Encapsulation"]', 1, 'medium'],
  ['Technologie', 'Quel réseau social a été fondé par Mark Zuckerberg en 2004 ?', '["Twitter", "MySpace", "Facebook", "LinkedIn"]', 2, 'easy'],
  ['Technologie', 'Quelle architecture de processeur est utilisée par la plupart des smartphones modernes ?', '["x86", "ARM", "MIPS", "RISC-V"]', 1, 'hard'],
  ['Technologie', 'Quel langage de programmation est principalement utilisé pour le développement iOS ?', '["Kotlin", "Swift", "Objective-C", "Dart"]', 1, 'medium'],
  ['Technologie', 'Quel algorithme de tri a une complexité moyenne de O(n log n) et utilise le principe diviser pour régner ?', '["Tri à bulles", "Tri par insertion", "Tri rapide (Quicksort)", "Tri par sélection"]', 2, 'hard'],
  ['Technologie', 'Quel protocole permet d\'attribuer automatiquement des adresses IP aux appareils d\'un réseau ?', '["DNS", "DHCP", "ARP", "NAT"]', 1, 'hard'],
  ['Technologie', 'En quelle année le premier iPhone a-t-il été commercialisé ?', '["2005", "2006", "2007", "2008"]', 2, 'medium'],
  ['Technologie', 'Quel type d\'attaque informatique consiste à surcharger un serveur de requêtes ?', '["Phishing", "DDoS", "Man-in-the-middle", "SQL Injection"]', 1, 'hard'],
  ['Technologie', 'Quel système de contrôle de version distribué a été créé par Linus Torvalds en 2005 ?', '["SVN", "Mercurial", "Git", "CVS"]', 2, 'hard'],
  ['Technologie', 'Quelle technologie blockchain a introduit les contrats intelligents (smart contracts) ?', '["Bitcoin", "Ethereum", "Ripple", "Litecoin"]', 1, 'hard'],
  ['Technologie', 'Quel modèle d\'intelligence artificielle de Google a battu le champion du monde de Go en 2016 ?', '["DeepBlue", "Watson", "AlphaGo", "GPT"]', 2, 'hard'],
  ['Technologie', 'Quel est le nombre maximum d\'adresses IPv4 possibles (approximativement) ?', '["16 millions", "256 millions", "4,3 milliards", "340 sextillions"]', 2, 'hard'],
  ['Technologie', 'Quel langage de balisage est utilisé pour structurer les pages web ?', '["CSS", "HTML", "JavaScript", "PHP"]', 1, 'easy'],
  ['Technologie', 'Quelle entreprise a créé le premier moteur de recherche commercial à succès avant Google ?', '["Bing", "AltaVista", "Yahoo", "Lycos"]', 2, 'hard'],
  ['Technologie', 'Quel concept de programmation orientée objet permet à une classe d\'hériter des propriétés d\'une autre ?', '["Abstraction", "Héritage", "Polymorphisme", "Encapsulation"]', 1, 'medium'],
  ['Technologie', 'Quel format de compression d\'images utilise une compression avec perte ?', '["PNG", "BMP", "JPEG", "TIFF"]', 2, 'hard'],
  ['Technologie', 'Quel est le nom du noyau (kernel) du système d\'exploitation Linux ?', '["GNU", "Linux", "UNIX", "Bash"]', 1, 'hard'],
  ['Technologie', 'Quelle norme Wi-Fi 6 a été introduite en 2019 ?', '["802.11n", "802.11ac", "802.11ax", "802.11be"]', 2, 'hard'],
  ['Technologie', 'Quel chercheur en IA est considéré comme le « parrain de l\'apprentissage profond » et a reçu le prix Turing en 2018 ?', '["Andrew Ng", "Yann LeCun", "Geoffrey Hinton", "Ian Goodfellow"]', 2, 'hard'],
  ['Technologie', 'Quelle structure de données fonctionne selon le principe LIFO (Last In, First Out) ?', '["File (Queue)", "Pile (Stack)", "Liste chaînée", "Arbre binaire"]', 1, 'medium'],
  ['Technologie', 'Quel protocole sécurisé est utilisé pour accéder à distance à un serveur via la ligne de commande ?', '["Telnet", "FTP", "SSH", "HTTP"]', 2, 'hard'],
  ['Technologie', 'Quelle entreprise a développé le langage de programmation TypeScript ?', '["Google", "Facebook", "Microsoft", "Apple"]', 2, 'hard'],
  ['Technologie', 'Quel est le principe fondamental de la méthode agile Scrum ?', '["Développement en cascade", "Sprints itératifs courts", "Documentation exhaustive", "Planification rigide"]', 1, 'medium'],
  ['Technologie', 'Quel type de base de données NoSQL utilise des documents JSON (comme MongoDB) ?', '["Base de données relationnelle", "Base de données orientée colonnes", "Base de données orientée documents", "Base de données orientée graphes"]', 2, 'hard'],
  ['Technologie', 'Quelle loi prédit que le nombre de transistors dans un circuit intégré double environ tous les deux ans ?', '["Loi de Murphy", "Loi de Moore", "Loi d\'Amdahl", "Loi de Metcalfe"]', 1, 'hard'],
  ['Technologie', 'Quel langage de programmation fonctionnel a été créé au MIT en 1958 ?', '["Fortran", "COBOL", "Lisp", "ALGOL"]', 2, 'hard'],
  ['Technologie', 'Quelle technologie permet d\'exécuter des applications dans des conteneurs isolés ?', '["VMware", "Docker", "Vagrant", "VirtualBox"]', 1, 'hard'],
  ['Technologie', 'Quel algorithme de hachage est recommandé pour le stockage sécurisé des mots de passe ?', '["MD5", "SHA-1", "bcrypt", "CRC32"]', 2, 'hard'],
  ['Technologie', 'Quelle couche du modèle OSI est responsable du routage des paquets ?', '["Couche liaison de données", "Couche réseau", "Couche transport", "Couche session"]', 1, 'hard'],
  ['Technologie', 'Quel service cloud d\'Amazon est le plus utilisé pour l\'hébergement de serveurs virtuels ?', '["S3", "Lambda", "EC2", "RDS"]', 2, 'hard'],
  ['Technologie', 'Quelle technique d\'apprentissage automatique utilise des réseaux de neurones à plusieurs couches cachées ?', '["Régression linéaire", "Apprentissage profond (Deep Learning)", "K-means", "Forêt aléatoire"]', 1, 'hard'],
  ['Technologie', 'Quel standard USB permet un débit théorique de 40 Gbps ?', '["USB 2.0", "USB 3.0", "USB 3.2 Gen 2x2", "USB4"]', 3, 'hard'],
  ['Technologie', 'Quelle vulnérabilité web permet à un attaquant d\'injecter du code malveillant dans les pages vues par d\'autres utilisateurs ?', '["SQL Injection", "XSS (Cross-Site Scripting)", "CSRF", "Buffer Overflow"]', 1, 'hard'],
  ['Technologie', 'Quel paradigme de programmation traite les calculs comme l\'évaluation de fonctions mathématiques ?', '["Programmation impérative", "Programmation orientée objet", "Programmation fonctionnelle", "Programmation logique"]', 2, 'hard'],
  ['Technologie', 'Quelle entreprise a racheté GitHub en 2018 pour 7,5 milliards de dollars ?', '["Google", "Amazon", "Microsoft", "Facebook"]', 2, 'hard'],
  ['Technologie', 'Quel système d\'exploitation open source basé sur Unix a été créé par Linus Torvalds en 1991 ?', '["FreeBSD", "Linux", "Minix", "Solaris"]', 1, 'medium'],
  ['Technologie', 'Quel modèle de langage développé par OpenAI a popularisé l\'IA générative en novembre 2022 ?', '["DALL-E", "GPT-3", "ChatGPT", "Codex"]', 2, 'medium'],

  // ===================== SANTÉ (41 questions) =====================
  ['Santé', 'Quel moustique est le principal vecteur du paludisme (malaria) ?', '["Aedes aegypti", "Culex", "Anopheles", "Mansonia"]', 2, 'hard'],
  ['Santé', 'Quel organe du corps humain produit la bile nécessaire à la digestion des graisses ?', '["Pancréas", "Estomac", "Foie", "Vésicule biliaire"]', 2, 'medium'],
  ['Santé', 'Quelle maladie est causée par le virus Ebola et provoque des fièvres hémorragiques ?', '["Dengue", "Maladie à virus Ebola", "Fièvre jaune", "Chikungunya"]', 1, 'medium'],
  ['Santé', 'Quel type de cellule du système immunitaire est principalement ciblé par le VIH ?', '["Lymphocytes B", "Lymphocytes T CD4+", "Neutrophiles", "Macrophages"]', 1, 'hard'],
  ['Santé', 'Quelle vitamine est synthétisée par la peau sous l\'effet des rayons ultraviolets ?', '["Vitamine A", "Vitamine B12", "Vitamine C", "Vitamine D"]', 3, 'medium'],
  ['Santé', 'Quel médicament antipaludéen a été découvert grâce à la médecine traditionnelle chinoise et a valu un prix Nobel en 2015 ?', '["Chloroquine", "Artémisinine", "Quinine", "Méfloquine"]', 1, 'hard'],
  ['Santé', 'Quelle maladie chronique est caractérisée par une glycémie élevée due à un déficit en insuline ?', '["Hypertension", "Diabète de type 1", "Hypothyroïdie", "Anémie"]', 1, 'medium'],
  ['Santé', 'Quel est le nom de la protéine de pointe (spike) du SARS-CoV-2 utilisée pour l\'entrée dans les cellules ?', '["Protéine N", "Protéine S", "Protéine M", "Protéine E"]', 1, 'hard'],
  ['Santé', 'Quelle organisation internationale a déclaré la variole éradiquée en 1980 ?', '["UNICEF", "OMS", "CDC", "MSF"]', 1, 'hard'],
  ['Santé', 'Quel neurotransmetteur est principalement associé à la régulation de l\'humeur et du bonheur ?', '["Dopamine", "Sérotonine", "Adrénaline", "GABA"]', 1, 'hard'],
  ['Santé', 'Quelle carence nutritionnelle provoque le rachitisme chez les enfants ?', '["Carence en fer", "Carence en vitamine D et calcium", "Carence en vitamine C", "Carence en iode"]', 1, 'hard'],
  ['Santé', 'Quel type de vaccin utilise un ARN messager pour induire une réponse immunitaire ?', '["Vaccin à virus inactivé", "Vaccin à vecteur viral", "Vaccin à ARNm", "Vaccin à sous-unités protéiques"]', 2, 'hard'],
  ['Santé', 'Quelle maladie tropicale négligée est causée par le parasite Trypanosoma et transmise par la mouche tsé-tsé ?', '["Leishmaniose", "Maladie du sommeil", "Filariose", "Schistosomiase"]', 1, 'hard'],
  ['Santé', 'Quel est l\'os le plus long du corps humain ?', '["Tibia", "Humérus", "Fémur", "Radius"]', 2, 'medium'],
  ['Santé', 'Quelle bactérie est responsable de la tuberculose ?', '["Staphylococcus aureus", "Mycobacterium tuberculosis", "Streptococcus pneumoniae", "Escherichia coli"]', 1, 'hard'],
  ['Santé', 'Combien de paires de nerfs crâniens possède le corps humain ?', '["8", "10", "12", "14"]', 2, 'hard'],
  ['Santé', 'Quelle maladie auto-immune attaque la gaine de myéline des nerfs dans le système nerveux central ?', '["Lupus", "Sclérose en plaques", "Polyarthrite rhumatoïde", "Maladie de Crohn"]', 1, 'hard'],
  ['Santé', 'Quel minéral est essentiel pour la production d\'hémoglobine dans les globules rouges ?', '["Calcium", "Zinc", "Fer", "Magnésium"]', 2, 'medium'],
  ['Santé', 'Quelle hormone est produite par les glandes surrénales en réponse au stress ?', '["Insuline", "Mélatonine", "Cortisol", "Thyroxine"]', 2, 'hard'],
  ['Santé', 'Quel agent pathogène cause le choléra ?', '["Salmonella typhi", "Vibrio cholerae", "Shigella", "Clostridium botulinum"]', 1, 'hard'],
  ['Santé', 'Quelle couche de la peau contient les mélanocytes qui produisent la mélanine ?', '["Derme", "Hypoderme", "Épiderme", "Couche cornée"]', 2, 'hard'],
  ['Santé', 'Quel est le groupe sanguin considéré comme « donneur universel » pour les globules rouges ?', '["A+", "B+", "AB+", "O-"]', 3, 'hard'],
  ['Santé', 'Quelle maladie est causée par une carence en vitamine C ?', '["Béribéri", "Pellagre", "Scorbut", "Rachitisme"]', 2, 'hard'],
  ['Santé', 'Quelle structure du cerveau est principalement responsable de la mémoire et de l\'apprentissage ?', '["Cervelet", "Hippocampe", "Thalamus", "Amygdale"]', 1, 'hard'],
  ['Santé', 'Quel type d\'hépatite se transmet principalement par voie fécale-orale ?', '["Hépatite A", "Hépatite B", "Hépatite C", "Hépatite D"]', 0, 'hard'],
  ['Santé', 'Combien de litres de sang le corps humain adulte contient-il en moyenne ?', '["3 litres", "5 litres", "7 litres", "10 litres"]', 1, 'medium'],
  ['Santé', 'Quelle technique d\'imagerie médicale utilise des ondes de radiofréquence et un champ magnétique ?', '["Radiographie", "Scanner (CT)", "IRM", "Échographie"]', 2, 'hard'],
  ['Santé', 'Quel virus est responsable de la fièvre jaune ?', '["Flavivirus", "Orthomyxovirus", "Retrovirus", "Coronavirus"]', 0, 'hard'],
  ['Santé', 'Quelle maladie neurodégénérative est caractérisée par des tremblements et une rigidité musculaire ?', '["Maladie d\'Alzheimer", "Maladie de Parkinson", "Sclérose latérale amyotrophique", "Maladie de Huntington"]', 1, 'medium'],
  ['Santé', 'Quel est l\'effet secondaire principal des antibiotiques sur la flore intestinale ?', '["Augmentation des bonnes bactéries", "Destruction de la flore intestinale (dysbiose)", "Renforcement du système immunitaire", "Aucun effet"]', 1, 'hard'],
  ['Santé', 'Quelle initiative de l\'OMS lancée en 1988 vise à éradiquer la poliomyélite ?', '["Initiative mondiale pour l\'éradication de la polio (IMEP)", "GAVI", "PEPFAR", "Roll Back Malaria"]', 0, 'hard'],
  ['Santé', 'Quel est le plus gros organe interne du corps humain ?', '["Poumons", "Foie", "Cerveau", "Intestin grêle"]', 1, 'medium'],
  ['Santé', 'Quelle maladie est causée par le plasmodium falciparum et est la forme la plus grave du paludisme ?', '["Paludisme à P. vivax", "Paludisme à P. falciparum", "Paludisme à P. ovale", "Paludisme à P. malariae"]', 1, 'hard'],
  ['Santé', 'Quel acide aminé est le précurseur de la sérotonine ?', '["Tyrosine", "Tryptophane", "Lysine", "Glutamine"]', 1, 'hard'],
  ['Santé', 'Quelle maladie infectieuse a tué le plus de personnes au cours de l\'histoire humaine ?', '["Peste", "Variole", "Tuberculose", "Paludisme"]', 2, 'hard'],
  ['Santé', 'Quel type de graisse alimentaire augmente le risque de maladies cardiovasculaires ?', '["Graisses monoinsaturées", "Graisses polyinsaturées", "Graisses trans", "Oméga-3"]', 2, 'hard'],
  ['Santé', 'Quelle glande endocrine en forme de papillon se trouve dans le cou et régule le métabolisme ?', '["Hypophyse", "Thyroïde", "Thymus", "Surrénales"]', 1, 'medium'],
  ['Santé', 'Quel vaccin développé par Edward Jenner en 1796 a permis de combattre la variole ?', '["Vaccin BCG", "Vaccin antivariolique (vaccine)", "Vaccin contre la rage", "Vaccin DTC"]', 1, 'hard'],
  ['Santé', 'Quelle condition médicale est caractérisée par une pression artérielle systolique supérieure à 140 mmHg ?', '["Hypotension", "Hypertension", "Tachycardie", "Bradycardie"]', 1, 'medium'],
  ['Santé', 'Quel organe est responsable de la filtration du sang et de la production d\'urine ?', '["Foie", "Reins", "Vessie", "Rate"]', 1, 'easy'],
  ['Santé', 'Quelle protéine fibreuse est le principal composant structurel de la peau, des tendons et des os ?', '["Kératine", "Collagène", "Élastine", "Actine"]', 1, 'hard'],
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
      message: `Batch 4: Added ${added} new questions, skipped ${skipped} duplicates`,
      total_questions: Number(totalRes.rows[0].c),
      categories: catCounts.rows,
    });
  } catch (err: any) {
    return errorResponse('Seed failed: ' + err.message, 500);
  }
}
