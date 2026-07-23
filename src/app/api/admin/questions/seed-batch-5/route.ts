import { successResponse, errorResponse, authenticateAdmin } from '../../../_lib/helpers';
import { getPool } from '../../../_lib/db';

type Q = [string, string, string, number, string];

const QUESTIONS: Q[] = [
  // ===================== CHIMIE (109 questions) =====================

  // --- Elements, periodic table, atomic structure ---
  ['Chimie', 'Quel element chimique possede le plus grand rayon atomique parmi les halogenes ?', '["Fluor", "Chlore", "Brome", "Iode"]', 3, 'hard'],
  ['Chimie', 'Quel element de la periode 3 du tableau periodique a la plus haute energie de premiere ionisation ?', '["Sodium", "Aluminium", "Chlore", "Argon"]', 3, 'hard'],
  ['Chimie', 'Quel est le seul element non metallique qui est liquide a temperature ambiante ?', '["Mercure", "Brome", "Gallium", "Cesium"]', 1, 'medium'],
  ['Chimie', 'Quel element de transition possede la configuration electronique [Ar] 3d10 4s1 ?', '["Zinc", "Cuivre", "Nickel", "Chrome"]', 1, 'hard'],
  ['Chimie', 'Quel est le nombre quantique magnetique (ml) maximal pour un electron dans une sous-couche d ?', '["1", "2", "3", "4"]', 1, 'hard'],
  ['Chimie', 'Quel element chimique possede la plus faible affinite electronique parmi les gaz nobles ?', '["Helium", "Neon", "Argon", "Krypton"]', 1, 'hard'],
  ['Chimie', 'Quel scientifique a propose le modele atomique planetaire avec un noyau central en 1911 ?', '["Niels Bohr", "Ernest Rutherford", "J.J. Thomson", "James Chadwick"]', 1, 'hard'],
  ['Chimie', 'Quel element du bloc f est utilise comme combustible dans les reacteurs nucleaires civils ?', '["Thorium", "Uranium", "Plutonium", "Neptunium"]', 1, 'medium'],
  ['Chimie', 'Quel est le nombre d\'orbitales dans une sous-couche f ?', '["3", "5", "7", "9"]', 2, 'hard'],
  ['Chimie', 'Quel element chimique de numero atomique 76 est le metal le plus dense naturellement ?', '["Platine", "Iridium", "Osmium", "Rhenium"]', 2, 'hard'],

  // --- Chemical bonding ---
  ['Chimie', 'Quel type de force intermoleculaire est responsable du point d\'ebullition eleve de l\'eau ?', '["Forces de London", "Forces dipole-dipole", "Liaisons hydrogene", "Liaisons covalentes"]', 2, 'hard'],
  ['Chimie', 'Combien de paires d\'electrons libres possede la molecule d\'eau (H2O) ?', '["0", "1", "2", "3"]', 2, 'medium'],
  ['Chimie', 'Quel est l\'ordre de liaison dans la molecule de diazote (N2) ?', '["1", "2", "3", "4"]', 2, 'hard'],
  ['Chimie', 'Quelle est la geometrie moleculaire du trifluorure de bore (BF3) selon la theorie VSEPR ?', '["Lineaire", "Trigonale plane", "Tetraedrique", "Pyramidale"]', 1, 'hard'],
  ['Chimie', 'Quel type de liaison est present dans le chlorure de sodium (NaCl) a l\'etat solide ?', '["Covalente", "Ionique", "Metallique", "Van der Waals"]', 1, 'easy'],
  ['Chimie', 'Quelle est l\'hybridation du carbone central dans l\'ethylene (C2H4) ?', '["sp", "sp2", "sp3", "sp3d"]', 1, 'hard'],
  ['Chimie', 'Quel concept decrit la delocalisation des electrons pi dans le benzene ?', '["Resonance (mesomerie)", "Isomerie", "Tautomerie", "Effet inductif"]', 0, 'hard'],
  ['Chimie', 'Quelle est la geometrie moleculaire du dioxyde de soufre (SO2) ?', '["Lineaire", "Coudee (angulaire)", "Trigonale plane", "Tetraedrique"]', 1, 'hard'],

  // --- Reactions and equilibrium ---
  ['Chimie', 'Quel est le nom de la constante d\'equilibre pour les reactions en phase gazeuse exprimee en pressions partielles ?', '["Kc", "Kp", "Ka", "Kb"]', 1, 'hard'],
  ['Chimie', 'Quel type de reaction se produit lorsqu\'un ion metallique forme un complexe avec des ligands ?', '["Precipitation", "Neutralisation", "Complexation (coordination)", "Dismutation"]', 2, 'hard'],
  ['Chimie', 'Quelle est la definition d\'un acide selon Bronsted-Lowry ?', '["Donneur de proton (H+)", "Accepteur de proton", "Donneur d\'electrons", "Accepteur d\'electrons"]', 0, 'medium'],
  ['Chimie', 'Quel est le produit de la reaction de dismutation du peroxyde d\'hydrogene (H2O2) ?', '["H2 et O2", "H2O et O2", "H2O et H2", "HO et O"]', 1, 'hard'],
  ['Chimie', 'Quel est le nom de la reaction ou un element remplace un autre dans un compose ?', '["Reaction de synthese", "Reaction de decomposition", "Reaction de substitution (deplacement simple)", "Reaction de double echange"]', 2, 'medium'],
  ['Chimie', 'Quel est l\'effet d\'un catalyseur sur l\'energie d\'activation d\'une reaction ?', '["Il l\'augmente", "Il la diminue", "Il ne la change pas", "Il la double"]', 1, 'medium'],
  ['Chimie', 'Quelle loi relie la vitesse de reaction a la concentration des reactifs ?', '["Loi de Hess", "Loi cinetique (loi de vitesse)", "Loi de Dalton", "Loi de Raoult"]', 1, 'hard'],
  ['Chimie', 'Quel est le nom du point sur un diagramme de phases ou les trois etats coexistent ?', '["Point critique", "Point triple", "Point d\'ebullition", "Point eutectique"]', 1, 'hard'],

  // --- Organic chemistry ---
  ['Chimie', 'Quel est le nom IUPAC de l\'alcane a 8 atomes de carbone en chaine lineaire ?', '["Heptane", "Octane", "Nonane", "Decane"]', 1, 'medium'],
  ['Chimie', 'Quel groupe fonctionnel caracterise les aldehydes ?', '["-OH", "-CHO", "-COOH", "-CO-"]', 1, 'hard'],
  ['Chimie', 'Quel est le produit principal de l\'hydratation d\'un alcene en milieu acide selon la regle de Markovnikov ?', '["Alcool primaire", "Alcool secondaire", "Alcool tertiaire", "Ether"]', 1, 'hard'],
  ['Chimie', 'Quel type de reaction organique implique la rupture d\'une liaison C-H par un radical libre ?', '["Addition electrophile", "Substitution radicalaire", "Elimination", "Addition nucleophile"]', 1, 'hard'],
  ['Chimie', 'Quel est le nom de la reaction qui transforme un aldehyde en acide carboxylique ?', '["Reduction", "Oxydation", "Hydrolyse", "Condensation"]', 1, 'hard'],
  ['Chimie', 'Quelle est la formule generale des alcynes ?', '["CnH2n+2", "CnH2n", "CnH2n-2", "CnH2n-4"]', 2, 'hard'],
  ['Chimie', 'Quel reactif est utilise pour le test de Tollens permettant d\'identifier les aldehydes ?', '["Liqueur de Fehling", "Nitrate d\'argent ammoniacal", "Permanganate de potassium", "Brome"]', 1, 'hard'],
  ['Chimie', 'Quel est le nom de la reaction d\'un ester avec une base forte pour donner un savon et du glycerol ?', '["Esterification", "Saponification", "Transesterification", "Hydrolyse acide"]', 1, 'hard'],
  ['Chimie', 'Quel type d\'isomerie est present entre le butan-1-ol et le butan-2-ol ?', '["Isomerie de chaine", "Isomerie de position", "Isomerie de fonction", "Isomerie Z/E"]', 1, 'hard'],
  ['Chimie', 'Quel compose aromatique a pour formule C6H5OH ?', '["Toluene", "Aniline", "Phenol", "Benzaldehyde"]', 2, 'hard'],
  ['Chimie', 'Quel est le nom de la reaction d\'addition d\'hydrogene (H2) sur une double liaison C=C ?', '["Deshydrogenation", "Hydrogenation", "Halogenation", "Hydratation"]', 1, 'medium'],

  // --- Biochemistry ---
  ['Chimie', 'Quelle base azotee est presente dans l\'ARN mais absente de l\'ADN ?', '["Adenine", "Guanine", "Uracile", "Thymine"]', 2, 'hard'],
  ['Chimie', 'Quel est le nom de la liaison qui unit deux acides amines dans une proteine ?', '["Liaison ester", "Liaison peptidique", "Liaison glycosidique", "Liaison phosphodiester"]', 1, 'medium'],
  ['Chimie', 'Quel coenzyme derive de la vitamine B3 (niacine) joue un role cle dans les reactions d\'oxydoreduction cellulaire ?', '["FAD", "NAD+/NADH", "Coenzyme A", "ATP"]', 1, 'hard'],
  ['Chimie', 'Quelle molecule lipidique constitue la structure de base des membranes cellulaires ?', '["Triglyceride", "Phospholipide", "Cholesterol", "Sphingolipide"]', 1, 'hard'],
  ['Chimie', 'Quel est le produit final de la glycolyse anaerobie dans les muscles humains ?', '["Ethanol", "Acide pyruvique", "Acide lactique", "Acetyl-CoA"]', 2, 'hard'],
  ['Chimie', 'Combien d\'acides amines essentiels le corps humain adulte ne peut-il pas synthetiser ?', '["6", "8", "9", "12"]', 2, 'hard'],
  ['Chimie', 'Quel type de structure proteique decrit l\'agencement en helice alpha ou en feuillet beta ?', '["Structure primaire", "Structure secondaire", "Structure tertiaire", "Structure quaternaire"]', 1, 'hard'],
  ['Chimie', 'Quelle vitamine est necessaire a la synthese du collagene et dont la carence cause le scorbut ?', '["Vitamine A", "Vitamine B12", "Vitamine C", "Vitamine D"]', 2, 'medium'],

  // --- Thermochemistry and thermodynamics ---
  ['Chimie', 'Quelle grandeur thermodynamique mesure le desordre d\'un systeme ?', '["Enthalpie", "Entropie", "Enthalpie libre", "Energie interne"]', 1, 'hard'],
  ['Chimie', 'Quelle loi de la thermodynamique stipule que l\'entropie d\'un cristal parfait est nulle au zero absolu ?', '["Premiere loi", "Deuxieme loi", "Troisieme loi", "Loi zero"]', 2, 'hard'],
  ['Chimie', 'Quel est le signe de la variation d\'enthalpie (DeltaH) pour une reaction exothermique ?', '["Positif", "Negatif", "Nul", "Variable"]', 1, 'medium'],
  ['Chimie', 'Quelle loi permet de calculer l\'enthalpie de reaction a partir des enthalpies de formation standard ?', '["Loi de Le Chatelier", "Loi de Hess", "Loi de Raoult", "Loi de Dalton"]', 1, 'hard'],
  ['Chimie', 'Quelle condition sur l\'enthalpie libre de Gibbs (DeltaG) indique qu\'une reaction est spontanee ?', '["DeltaG > 0", "DeltaG < 0", "DeltaG = 0", "DeltaG = DeltaH"]', 1, 'hard'],
  ['Chimie', 'Quel est le nom du diagramme qui represente l\'energie potentielle le long du chemin reactionnel ?', '["Diagramme de phase", "Diagramme energetique (profil reactionnel)", "Diagramme de Lewis", "Diagramme d\'Ellingham"]', 1, 'hard'],

  // --- Electrochemistry ---
  ['Chimie', 'Quel est le potentiel standard de l\'electrode a hydrogene (ESH) par convention ?', '["0,00 V", "+1,23 V", "-0,76 V", "+0,34 V"]', 0, 'hard'],
  ['Chimie', 'A quelle electrode se produit l\'oxydation dans une pile electrochimique ?', '["Cathode", "Anode", "Les deux", "Aucune"]', 1, 'medium'],
  ['Chimie', 'Quel metal est utilise comme anode sacrificielle pour proteger les coques de navires en acier ?', '["Cuivre", "Zinc", "Etain", "Nickel"]', 1, 'hard'],
  ['Chimie', 'Quel chimiste italien a invente la premiere pile electrochimique en 1800 ?', '["Luigi Galvani", "Alessandro Volta", "Amedeo Avogadro", "Stanislao Cannizzaro"]', 1, 'hard'],
  ['Chimie', 'Quelle equation relie le potentiel d\'une cellule electrochimique a la concentration des especes en solution ?', '["Equation de Clausius-Clapeyron", "Equation de Nernst", "Equation d\'Arrhenius", "Equation de Van der Waals"]', 1, 'hard'],
  ['Chimie', 'Quel est le nom du processus electrochimique utilise pour deposer une couche de metal sur un objet ?', '["Electrodialyse", "Galvanoplastie (electrodeposition)", "Electrolyse", "Electrophorese"]', 1, 'hard'],

  // --- Industrial chemistry ---
  ['Chimie', 'Quel procede industriel est utilise pour la production du carbonate de sodium (soude) ?', '["Procede Haber-Bosch", "Procede Solvay", "Procede Frasch", "Procede Bayer"]', 1, 'hard'],
  ['Chimie', 'Quel procede est utilise pour extraire l\'aluminium de la bauxite ?', '["Procede Bessemer", "Procede Hall-Heroult", "Procede Bayer", "Procede Dow"]', 1, 'hard'],
  ['Chimie', 'Quel est le catalyseur principal utilise dans le craquage catalytique du petrole ?', '["Platine", "Zeolite", "Oxyde de vanadium", "Nickel de Raney"]', 1, 'hard'],
  ['Chimie', 'Quel procede industriel convertit l\'ammoniac en acide nitrique en plusieurs etapes ?', '["Procede Contact", "Procede Ostwald", "Procede Solvay", "Procede Claus"]', 1, 'hard'],
  ['Chimie', 'Quel produit chimique est fabrique en plus grande quantite dans le monde chaque annee ?', '["Ammoniac", "Acide sulfurique", "Ethylene", "Soude caustique"]', 1, 'hard'],
  ['Chimie', 'Quel procede est utilise pour dessaler l\'eau de mer par passage a travers une membrane semi-permeable ?', '["Distillation", "Osmose inverse", "Electrodialyse", "Echange d\'ions"]', 1, 'hard'],

  // --- Acids, bases, and pH ---
  ['Chimie', 'Quel est le pKa approximatif de l\'acide acetique (CH3COOH) ?', '["2,5", "4,75", "7,0", "9,25"]', 1, 'hard'],
  ['Chimie', 'Quelle est la definition d\'un acide selon Lewis ?', '["Donneur de proton", "Accepteur de paire d\'electrons", "Donneur d\'electrons", "Substance qui libere des ions H+"]', 1, 'hard'],
  ['Chimie', 'Quel est le pH d\'une solution tampon composee d\'acide acetique et d\'acetate de sodium en quantites equimolaires (pKa = 4,75) ?', '["2,0", "4,75", "7,0", "9,25"]', 1, 'hard'],
  ['Chimie', 'Quel indicateur colore vire du jaune au bleu autour de pH 7 ?', '["Phenolphtaleine", "Bleu de bromothymol", "Rouge de methyle", "Helianthin"]', 1, 'hard'],
  ['Chimie', 'Quel est le produit ionique de l\'eau (Ke) a 25 degres Celsius ?', '["10^-7", "10^-14", "10^-10", "10^-12"]', 1, 'hard'],
  ['Chimie', 'Quel type de solution resiste aux variations de pH lors de l\'ajout de petites quantites d\'acide ou de base ?', '["Solution saturee", "Solution tampon", "Solution colloide", "Solution sursaturee"]', 1, 'medium'],

  // --- Nuclear chemistry ---
  ['Chimie', 'Quel type de rayonnement nucleaire est constitue de noyaux d\'helium-4 ?', '["Rayonnement alpha", "Rayonnement beta", "Rayonnement gamma", "Rayonnement neutronique"]', 0, 'hard'],
  ['Chimie', 'Quelle est la demi-vie approximative du carbone-14, utilise en datation radiocarbone ?', '["500 ans", "1 600 ans", "5 730 ans", "14 000 ans"]', 2, 'hard'],
  ['Chimie', 'Quel est le nom du processus par lequel un noyau lourd se divise en deux noyaux plus legers ?', '["Fusion nucleaire", "Fission nucleaire", "Desintegration alpha", "Transmutation"]', 1, 'medium'],
  ['Chimie', 'Quel element radioactif a ete decouvert par Marie et Pierre Curie en 1898 ?', '["Uranium", "Radium", "Thorium", "Actinium"]', 1, 'hard'],
  ['Chimie', 'Quel isotope de l\'hydrogene possede un proton et un neutron dans son noyau ?', '["Protium", "Deuterium", "Tritium", "Hydrogene-4"]', 1, 'hard'],
  ['Chimie', 'Quel type de desintegration nucleaire emet un electron (beta moins) ?', '["Conversion d\'un proton en neutron", "Conversion d\'un neutron en proton", "Emission d\'un noyau d\'helium", "Emission de photon gamma"]', 1, 'hard'],

  // --- Environmental chemistry ---
  ['Chimie', 'Quels gaz sont principalement responsables de la destruction de la couche d\'ozone ?', '["CO2 et CH4", "CFC (chlorofluorocarbones)", "NOx et SOx", "O3 et H2O2"]', 1, 'hard'],
  ['Chimie', 'Quel protocole international de 1987 a limite la production des substances appauvrissant la couche d\'ozone ?', '["Protocole de Kyoto", "Protocole de Montreal", "Accord de Paris", "Convention de Bale"]', 1, 'hard'],
  ['Chimie', 'Quel phenomene chimique cause les pluies acides ?', '["Emission de CO2", "Emission de SO2 et NOx qui forment des acides dans l\'atmosphere", "Liberation de methane", "Decomposition de l\'ozone"]', 1, 'hard'],
  ['Chimie', 'Quel metal lourd toxique etait autrefois ajoute a l\'essence comme antidetonant ?', '["Mercure", "Cadmium", "Plomb", "Arsenic"]', 2, 'hard'],
  ['Chimie', 'Quel gaz a effet de serre a un potentiel de rechauffement global environ 300 fois superieur au CO2 sur 100 ans ?', '["Methane (CH4)", "Protoxyde d\'azote (N2O)", "Ozone (O3)", "Hexafluorure de soufre (SF6)"]', 1, 'hard'],

  // --- Lab techniques ---
  ['Chimie', 'Quelle technique analytique utilise l\'absorption de lumiere pour determiner la concentration d\'une substance en solution ?', '["Spectrometrie de masse", "Spectrophotometrie UV-visible", "Resonance magnetique nucleaire", "Diffraction des rayons X"]', 1, 'hard'],
  ['Chimie', 'Quelle methode de purification est basee sur les differences de solubilite a differentes temperatures ?', '["Distillation", "Filtration", "Recristallisation", "Sublimation"]', 2, 'hard'],
  ['Chimie', 'Quel instrument mesure precisement le volume d\'une solution lors d\'un titrage ?', '["Pipette graduee", "Eprouvette", "Burette", "Fiole jaugee"]', 2, 'medium'],
  ['Chimie', 'Quelle technique spectroscopique permet d\'identifier les groupes fonctionnels d\'une molecule organique par absorption infrarouge ?', '["Spectroscopie UV-visible", "Spectroscopie infrarouge (IR)", "Spectroscopie RMN", "Spectrometrie de masse"]', 1, 'hard'],
  ['Chimie', 'Quel type de chromatographie utilise un gaz comme phase mobile ?', '["Chromatographie sur couche mince", "Chromatographie en phase gazeuse (CPG)", "Chromatographie HPLC", "Chromatographie d\'exclusion"]', 1, 'hard'],
  ['Chimie', 'Quel est le nom de l\'operation de laboratoire consistant a separer un solide d\'un liquide a l\'aide d\'un papier filtre ?', '["Decantation", "Centrifugation", "Filtration", "Evaporation"]', 2, 'easy'],

  // --- Famous chemists ---
  ['Chimie', 'Quel chimiste allemand a synthetise le premier compose organique (l\'uree) a partir de composants inorganiques en 1828 ?', '["Justus von Liebig", "Friedrich Wohler", "August Kekule", "Emil Fischer"]', 1, 'hard'],
  ['Chimie', 'Quelle chimiste polonaise naturalisee francaise a recu deux prix Nobel en physique (1903) et en chimie (1911) ?', '["Irene Joliot-Curie", "Dorothy Hodgkin", "Marie Curie", "Rosalind Franklin"]', 2, 'medium'],
  ['Chimie', 'Quel chimiste britannique a decouvert l\'oxygene independamment de Scheele en 1774 ?', '["Henry Cavendish", "Joseph Priestley", "Humphry Davy", "Robert Boyle"]', 1, 'hard'],
  ['Chimie', 'Quel chimiste suedois a introduit le concept d\'acide et de base en termes de dissociation ionique en solution aqueuse en 1887 ?', '["Jons Jacob Berzelius", "Svante Arrhenius", "Alfred Nobel", "Carl Wilhelm Scheele"]', 1, 'hard'],
  ['Chimie', 'Quel chimiste allemand a propose la structure hexagonale du benzene en 1865 ?', '["Friedrich Wohler", "Justus von Liebig", "August Kekule", "Hermann Kolbe"]', 2, 'hard'],
  ['Chimie', 'Quel chimiste a recu le prix Nobel en 1918 pour la synthese de l\'ammoniac, malgre la controverse sur son role dans les armes chimiques ?', '["Fritz Haber", "Carl Bosch", "Walther Nernst", "Wilhelm Ostwald"]', 0, 'hard'],

  // --- Polymers ---
  ['Chimie', 'Quel est le monomere du polychlorure de vinyle (PVC) ?', '["Ethylene", "Propylene", "Chlorure de vinyle", "Styrene"]', 2, 'hard'],
  ['Chimie', 'Quel type de polymere possede des chaines lineaires sans ramifications, ce qui le rend recyclable par fusion ?', '["Thermodurcissable", "Thermoplastique", "Elastomere", "Resine epoxyde"]', 1, 'hard'],
  ['Chimie', 'Quel polymere naturel est compose de monomeres de beta-glucose lies en chaine lineaire ?', '["Amidon", "Glycogene", "Cellulose", "Chitine"]', 2, 'hard'],
  ['Chimie', 'Quel est le nom du polymere synthetique utilise pour fabriquer les bouteilles en plastique (PET) ?', '["Polyethylene", "Polypropylene", "Polyethylene terephtalate", "Polystyrene"]', 2, 'hard'],
  ['Chimie', 'Quel chimiste americain a developpe le nylon, le premier polymere synthetique a usage textile, en 1935 ?', '["Leo Baekeland", "Wallace Carothers", "Hermann Staudinger", "Karl Ziegler"]', 1, 'hard'],

  // --- Additional advanced topics ---
  ['Chimie', 'Quel est le nom de l\'effet par lequel un substituant sur un cycle aromatique oriente la substitution electrophile en position ortho/para ou meta ?', '["Effet mesomere", "Effet inductif", "Effet de substituant (orienteur)", "Effet stereoelectronique"]', 2, 'hard'],
  ['Chimie', 'Quelle regle empirique prevoit que la vitesse de reaction double approximativement pour chaque augmentation de 10 degres Celsius ?', '["Regle de Markovnikov", "Regle de Van\'t Hoff", "Regle de Hund", "Regle de Zaitsev"]', 1, 'hard'],
  ['Chimie', 'Quel est le nom du diagramme qui classe les oxydes metalliques selon leur stabilite thermodynamique en fonction de la temperature ?', '["Diagramme de phases", "Diagramme d\'Ellingham", "Diagramme d\'Arrhenius", "Diagramme de Pourbaix"]', 1, 'hard'],
  ['Chimie', 'Quel est le nombre de coordination du fer dans l\'ion complexe hexacyanoferrate(II) [Fe(CN)6]4- ?', '["2", "4", "6", "8"]', 2, 'hard'],
  ['Chimie', 'Quelle regle stipule que les electrons remplissent les orbitales d\'un meme sous-niveau avec des spins paralleles avant de s\'apparier ?', '["Regle de Pauli", "Regle de Hund", "Regle de l\'Aufbau", "Regle de Klechkowski"]', 1, 'hard'],
  ['Chimie', 'Quel phenomene explique que le point d\'ebullition du fluorure d\'hydrogene (HF) est anormalement eleve par rapport au chlorure d\'hydrogene (HCl) ?', '["Liaisons hydrogene dans HF", "Masse molaire plus elevee de HF", "Liaison covalente plus forte dans HF", "Polarisabilite de HF"]', 0, 'hard'],
  ['Chimie', 'Quel chimiste a enonce le principe d\'exclusion selon lequel deux electrons d\'un meme atome ne peuvent avoir les quatre memes nombres quantiques ?', '["Heisenberg", "Pauli", "Schrodinger", "Bohr"]', 1, 'hard'],
  ['Chimie', 'Quelle equation d\'etat des gaz tient compte du volume propre des molecules et des forces d\'attraction intermoleculaires ?', '["Equation des gaz parfaits (PV=nRT)", "Equation de Van der Waals", "Equation de Clausius-Clapeyron", "Equation de Boltzmann"]', 1, 'hard'],
  ['Chimie', 'Quel est le nom de la serie d\'activite qui classe les metaux selon leur tendance a s\'oxyder ?', '["Serie electrochimique (serie d\'activite des metaux)", "Tableau periodique", "Echelle de Pauling", "Classification de Goldschmidt"]', 0, 'hard'],
  ['Chimie', 'Quel type de cristal est forme par des atomes partageant des electrons dans un reseau tridimensionnel continu, comme le diamant ?', '["Cristal ionique", "Cristal metallique", "Cristal covalent (atomique)", "Cristal moleculaire"]', 2, 'hard'],
  ['Chimie', 'Quelle propriete des solutions colligatives depend du nombre de particules de solute et non de leur nature ?', '["Viscosite", "Abaissement du point de congelation", "Densite", "Couleur"]', 1, 'hard'],
  ['Chimie', 'Quel est le produit principal de la reduction de l\'ion permanganate (MnO4-) en milieu acide ?', '["MnO2", "Mn2+", "Mn", "MnO4^2-"]', 1, 'hard'],

  // ===================== POLITIQUE (77 questions) =====================

  // --- DRC Constitution and governance ---
  ['Politique', 'Quel article de la Constitution de la RDC de 2006 consacre le droit de tout citoyen de presenter sa candidature aux elections ?', '["Article 5", "Article 10", "Article 13", "Article 14"]', 2, 'hard'],
  ['Politique', 'Quel organe est charge du controle de la constitutionnalite des lois en RDC ?', '["Cour supreme de justice", "Cour constitutionnelle", "Conseil d\'Etat", "Cour de cassation"]', 1, 'hard'],
  ['Politique', 'Combien de senateurs siegent au Senat de la RDC selon la Constitution de 2006 ?', '["80", "100", "108", "120"]', 2, 'hard'],
  ['Politique', 'Quel est le mode de designation des gouverneurs de province en RDC selon la Constitution ?', '["Nommes par le President", "Elus par les assemblees provinciales", "Elus au suffrage universel direct", "Nommes par le Premier ministre"]', 1, 'hard'],
  ['Politique', 'Quel article de la Constitution de la RDC dispose que la souverainete nationale appartient au peuple ?', '["Article 1", "Article 3", "Article 5", "Article 10"]', 2, 'hard'],
  ['Politique', 'Quel est le titre du chapitre de la Constitution de la RDC qui traite des libertes publiques et des droits fondamentaux ?', '["Titre I", "Titre II", "Titre III", "Titre IV"]', 1, 'hard'],
  ['Politique', 'Quelle institution est chargee de la gestion de la fonction publique en RDC ?', '["Presidence de la Republique", "Primature", "Ministere de la Fonction publique", "Assemblee nationale"]', 2, 'hard'],
  ['Politique', 'Quel article de la Constitution de la RDC garantit l\'independance du pouvoir judiciaire ?', '["Article 100", "Article 149", "Article 175", "Article 200"]', 1, 'hard'],

  // --- DRC provinces and geography ---
  ['Politique', 'Quelle province de la RDC a pour chef-lieu la ville de Mbuji-Mayi ?', '["Kasai", "Kasai-Central", "Kasai-Oriental", "Lomami"]', 2, 'hard'],
  ['Politique', 'Quelle province de la RDC, creee lors du decoupage de 2015, a pour chef-lieu Tshikapa ?', '["Kasai", "Kasai-Central", "Kwilu", "Kwango"]', 0, 'hard'],
  ['Politique', 'Quelle est la province la plus peuplee de la RDC apres Kinshasa ?', '["Nord-Kivu", "Haut-Katanga", "Kongo-Central", "Ituri"]', 0, 'hard'],
  ['Politique', 'Quelle province de la RDC a pour chef-lieu Kananga ?', '["Kasai-Oriental", "Kasai-Central", "Lomami", "Sankuru"]', 1, 'hard'],
  ['Politique', 'Quel est le statut administratif de Kinshasa selon la Constitution de la RDC ?', '["Province autonome", "Ville-province (ayant le statut de province)", "District federal", "Capitale nationale sans statut provincial"]', 1, 'hard'],

  // --- Political leaders of DRC ---
  ['Politique', 'Qui fut le premier president de la Republique Democratique du Congo independante ?', '["Patrice Lumumba", "Joseph Kasa-Vubu", "Mobutu Sese Seko", "Moise Tshombe"]', 1, 'medium'],
  ['Politique', 'Quel Premier ministre de la RDC a ete nomme a la suite de l\'Accord de Sun City en 2003 ?', '["Kengo wa Dondo", "Antoine Gizenga", "Adolphe Muzito", "Augustin Matata Ponyo"]', 1, 'hard'],
  ['Politique', 'En quelle annee Laurent-Desire Kabila a-t-il renverse Mobutu et pris le pouvoir en RDC ?', '["1994", "1996", "1997", "1999"]', 2, 'hard'],
  ['Politique', 'Quel opposant historique congolais a fonde l\'UDPS (Union pour la Democratie et le Progres Social) en 1982 ?', '["Antoine Gizenga", "Etienne Tshisekedi", "Jean-Pierre Bemba", "Vital Kamerhe"]', 1, 'medium'],
  ['Politique', 'Qui est devenu president de la RDC apres l\'assassinat de Laurent-Desire Kabila en janvier 2001 ?', '["Azarias Ruberwa", "Joseph Kabila", "Arthur Z\'Ahidi Ngoma", "Jean-Pierre Bemba"]', 1, 'medium'],
  ['Politique', 'Quel homme politique congolais a ete vice-president de la RDC pendant la transition (2003-2006) et fut ensuite condamne par la CPI ?', '["Thomas Lubanga", "Bosco Ntaganda", "Jean-Pierre Bemba", "Vital Kamerhe"]', 2, 'hard'],

  // --- African Union ---
  ['Politique', 'En quelle annee l\'Organisation de l\'Unite Africaine (OUA) a-t-elle ete fondee a Addis-Abeba ?', '["1960", "1963", "1965", "1970"]', 1, 'hard'],
  ['Politique', 'Quel est le nom de l\'organe judiciaire de l\'Union Africaine base a Arusha en Tanzanie ?', '["Cour de Justice de l\'UA", "Cour africaine des droits de l\'homme et des peuples", "Tribunal africain", "Cour penale africaine"]', 1, 'hard'],
  ['Politique', 'Quel document de l\'Union Africaine, adopte en 2000, definit les organes et le fonctionnement de l\'organisation ?', '["Charte de l\'OUA", "Acte constitutif de l\'Union Africaine", "Protocole de Maputo", "Declaration de Durban"]', 1, 'hard'],
  ['Politique', 'Quel mecanisme de l\'Union Africaine permet l\'evaluation par les pairs de la gouvernance des Etats membres ?', '["NEPAD", "MAEP (Mecanisme Africain d\'Evaluation par les Pairs)", "Conseil de Paix et de Securite", "Agenda 2063"]', 1, 'hard'],
  ['Politique', 'Quel est le nom du programme de developpement a long terme de l\'Union Africaine lance en 2013 ?', '["NEPAD", "Vision 2020", "Agenda 2063", "Plan d\'action de Lagos"]', 2, 'hard'],
  ['Politique', 'Quel president rwandais a preside la Commission de l\'Union Africaine consacree a la reforme institutionnelle ?', '["Yoweri Museveni", "Paul Kagame", "Denis Sassou-Nguesso", "John Magufuli"]', 1, 'hard'],

  // --- SADC and regional organizations ---
  ['Politique', 'En quelle annee la SADC (Communaute de developpement de l\'Afrique australe) a-t-elle ete creee sous sa forme actuelle ?', '["1980", "1985", "1992", "2000"]', 2, 'hard'],
  ['Politique', 'Combien d\'Etats membres compte la SADC en 2024 ?', '["12", "14", "16", "18"]', 2, 'hard'],
  ['Politique', 'Quel traite fondateur de la CEEAC a ete signe a Libreville en 1983 ?', '["Traite d\'Abuja", "Traite de Libreville", "Traite de Kinshasa", "Traite de Brazzaville"]', 1, 'hard'],
  ['Politique', 'Quel est l\'organe supreme de decision de la SADC ?', '["Conseil des ministres", "Sommet des chefs d\'Etat et de gouvernement", "Secretariat", "Comite des ambassadeurs"]', 1, 'hard'],
  ['Politique', 'Quel pays assure le siege du Secretariat de la SADC ?', '["Afrique du Sud", "Botswana", "Tanzanie", "Zambie"]', 1, 'hard'],

  // --- Elections and electoral systems ---
  ['Politique', 'Quel type de scrutin est utilise pour les elections legislatives nationales en RDC ?', '["Scrutin uninominal majoritaire a un tour", "Scrutin proportionnel de listes ouvertes", "Scrutin mixte proportionnel et majoritaire", "Scrutin de liste bloquee"]', 2, 'hard'],
  ['Politique', 'Quelle est la duree du mandat des deputes nationaux en RDC ?', '["4 ans", "5 ans", "6 ans", "7 ans"]', 1, 'hard'],
  ['Politique', 'Quel concept electoral designe le seuil minimum de voix qu\'un parti doit atteindre pour obtenir des sieges ?', '["Quorum", "Seuil electoral (seuil de representation)", "Majorite qualifiee", "Quotient electoral"]', 1, 'hard'],
  ['Politique', 'Dans quel pays africain le systeme electoral utilise la representation proportionnelle a la plus grande moyenne depuis l\'independance ?', '["Afrique du Sud", "Kenya", "Nigeria", "RDC"]', 0, 'hard'],
  ['Politique', 'Quel est le nom du bulletin unique utilise lors des elections en RDC, ou tous les candidats figurent sur un seul document ?', '["Bulletin de vote unique", "Bulletin panachage", "Bulletin individuel", "Bulletin de liste"]', 0, 'hard'],

  // --- Political parties ---
  ['Politique', 'Quel parti politique de la RDC a ete fonde par Jean-Pierre Bemba ?', '["UDPS", "MLC (Mouvement de Liberation du Congo)", "PPRD", "UNC"]', 1, 'hard'],
  ['Politique', 'Quel parti politique congolais a ete cree par Joseph Kabila pour soutenir sa presidence ?', '["MLC", "UDPS", "PPRD (Parti du Peuple pour la Reconstruction et la Democratie)", "UNC"]', 2, 'hard'],
  ['Politique', 'Quel mouvement politique en Afrique du Sud a mene la lutte contre l\'apartheid sous la direction de Nelson Mandela ?', '["PAC", "ANC (Congres National Africain)", "IFP", "COSATU"]', 1, 'medium'],
  ['Politique', 'Quel parti politique kenyan a porte Jomo Kenyatta au pouvoir apres l\'independance ?', '["KADU", "KANU (Kenya African National Union)", "ODM", "Jubilee"]', 1, 'hard'],

  // --- International relations and Africa ---
  ['Politique', 'Quel accord de paix de 2013, signe a Addis-Abeba, engage les pays de la region des Grands Lacs a stabiliser l\'est de la RDC ?', '["Accord de Lusaka", "Accord-cadre d\'Addis-Abeba", "Accord de Nairobi", "Accord de Kampala"]', 1, 'hard'],
  ['Politique', 'Quelle organisation des Nations Unies a son siege a Nairobi et se consacre a l\'environnement ?', '["UNICEF", "PNUD", "PNUE (Programme des Nations Unies pour l\'Environnement)", "FAO"]', 2, 'hard'],
  ['Politique', 'Quel est le nom de la force regionale deployee dans l\'est de la RDC par la Communaute d\'Afrique de l\'Est en 2022-2023 ?', '["MONUSCO", "Force regionale de la SADC", "Force regionale de l\'EAC", "AMISOM"]', 2, 'hard'],
  ['Politique', 'Quelle convention internationale de 1948 definit et punit le crime de genocide ?', '["Convention de Geneve", "Convention pour la prevention et la repression du crime de genocide", "Convention de La Haye", "Statut de Rome"]', 1, 'hard'],
  ['Politique', 'Quel pays africain a ete le premier a se retirer de la Cour penale internationale en 2017 ?', '["Afrique du Sud", "Burundi", "Gambie", "Kenya"]', 1, 'hard'],

  // --- Political philosophy ---
  ['Politique', 'Quel philosophe a ecrit "Le Prince" (1513), un traite sur la conquete et l\'exercice du pouvoir politique ?', '["Thomas Hobbes", "Jean-Jacques Rousseau", "Nicolas Machiavel", "John Locke"]', 2, 'hard'],
  ['Politique', 'Quel penseur africain a theorise le concept de "conscience noire" en Afrique du Sud ?', '["Nelson Mandela", "Steve Biko", "Desmond Tutu", "Walter Sisulu"]', 1, 'hard'],
  ['Politique', 'Quel philosophe francais des Lumieres a ecrit "De l\'esprit des lois" et a theorise la separation des pouvoirs ?', '["Voltaire", "Diderot", "Montesquieu", "Rousseau"]', 2, 'hard'],
  ['Politique', 'Quel concept politique designe le pouvoir absolu et indivisible de l\'Etat sur son territoire ?', '["Federalisme", "Souverainete", "Decentralisation", "Subsidiarite"]', 1, 'hard'],
  ['Politique', 'Quel philosophe anglais a theorise l\'etat de nature comme une "guerre de tous contre tous" dans le Leviathan (1651) ?', '["John Locke", "Thomas Hobbes", "David Hume", "Edmund Burke"]', 1, 'hard'],

  // --- Human rights in Africa ---
  ['Politique', 'Quel protocole additionnel a la Charte africaine traite specifiquement des droits des femmes en Afrique ?', '["Protocole de Maputo", "Protocole de Banjul", "Protocole d\'Addis-Abeba", "Protocole de Kigali"]', 0, 'hard'],
  ['Politique', 'Quelle commission de l\'Union Africaine est chargee de la promotion et de la protection des droits de l\'homme sur le continent ?', '["Commission africaine des droits de l\'homme et des peuples", "Conseil de Paix et de Securite", "Commission de l\'UA", "Parlement panafricain"]', 0, 'hard'],
  ['Politique', 'Quel est le nom du processus de justice transitionnelle utilise en Afrique du Sud apres l\'apartheid ?', '["Tribunal penal special", "Commission Verite et Reconciliation (CVR)", "Cour constitutionnelle", "Amnistie generale"]', 1, 'hard'],
  ['Politique', 'Quelle convention de l\'OUA de 1969 regit les aspects propres aux problemes des refugies en Afrique ?', '["Convention de Geneve", "Convention de l\'OUA sur les refugies", "Protocole de New York", "Convention de Kampala"]', 1, 'hard'],

  // --- UN in Africa ---
  ['Politique', 'Quel est le nom de la mission de l\'ONU deployee au Mali a partir de 2013 ?', '["MONUSCO", "MINUSMA", "ONUCI", "MINUAD"]', 1, 'hard'],
  ['Politique', 'Quelle agence de l\'ONU est responsable de l\'aide aux refugies dans le monde ?', '["UNICEF", "PNUD", "HCR (Haut-Commissariat des Nations Unies pour les refugies)", "OMS"]', 2, 'medium'],
  ['Politique', 'Quelle resolution du Conseil de securite a autorise l\'intervention en Libye en 2011 ?', '["Resolution 1970", "Resolution 1973", "Resolution 2085", "Resolution 2098"]', 1, 'hard'],
  ['Politique', 'Quel est le nombre total d\'Etats membres de l\'Organisation des Nations Unies en 2024 ?', '["189", "191", "193", "195"]', 2, 'hard'],

  // --- Peace accords and conflicts ---
  ['Politique', 'Quel accord de cessez-le-feu de 1999 visait a mettre fin a la deuxieme guerre du Congo ?', '["Accord de Sun City", "Accord de Lusaka", "Accord d\'Addis-Abeba", "Accord de Pretoria"]', 1, 'hard'],
  ['Politique', 'Quel accord de paix de 2000 a mis fin au conflit entre l\'Ethiopie et l\'Erythree ?', '["Accord d\'Alger", "Accord d\'Arusha", "Accord de Khartoum", "Accord de Nairobi"]', 0, 'hard'],
  ['Politique', 'Quel accord de paix signe a Arusha en 2000 a tente de mettre fin a la guerre civile au Burundi ?', '["Accord de Lusaka", "Accord d\'Arusha pour la paix et la reconciliation au Burundi", "Accord de Pretoria", "Accord de Sun City"]', 1, 'hard'],
  ['Politique', 'Quel groupe arme a mene une rebellion dans l\'est de la RDC en 2012-2013 avant d\'etre defait par les FARDC et la MONUSCO ?', '["CNDP", "M23", "ADF", "Mai-Mai"]', 1, 'hard'],
  ['Politique', 'Quel est le nom de la brigade d\'intervention de la MONUSCO, premiere force offensive de l\'ONU, creee en 2013 ?', '["Force de reaction rapide", "Brigade d\'intervention de la Force (FIB)", "Casques bleus offensifs", "Force multinationale"]', 1, 'hard'],

  // --- Parliamentary systems ---
  ['Politique', 'Quel est le role du Premier ministre dans le systeme semi-presidentiel de la RDC ?', '["Chef de l\'Etat", "Chef du gouvernement issu de la majorite parlementaire", "President du Senat", "Commandant des forces armees"]', 1, 'hard'],
  ['Politique', 'Quel mecanisme parlementaire permet a l\'Assemblee nationale de renverser le gouvernement en RDC ?', '["Referendum", "Motion de censure", "Dissolution", "Petition populaire"]', 1, 'medium'],
  ['Politique', 'Quel est le quorum requis pour que l\'Assemblee nationale de la RDC puisse deliberer valablement ?', '["Un tiers des membres", "La majorite absolue des membres", "Les deux tiers des membres", "Les trois quarts des membres"]', 1, 'hard'],
  ['Politique', 'Qui assure l\'interim de la presidence de la RDC en cas de vacance selon la Constitution ?', '["Le Premier ministre", "Le president de l\'Assemblee nationale", "Le president du Senat", "Le president de la Cour constitutionnelle"]', 2, 'hard'],

  // --- Additional African politics ---
  ['Politique', 'Quel pays africain a adopte le systeme federatif avec des Etats regionaux bases sur l\'ethnicite ?', '["Nigeria", "Ethiopie", "Afrique du Sud", "Kenya"]', 1, 'hard'],
  ['Politique', 'Quel est le nom de l\'accord de libre-echange continental africain entre en vigueur en 2021 ?', '["COMESA", "ZLECAf (Zone de Libre-Echange Continentale Africaine)", "CEDEAO", "SACU"]', 1, 'hard'],
  ['Politique', 'Quel coup d\'Etat militaire au Mali en 2020 a renverse le president Ibrahim Boubacar Keita ?', '["Coup d\'Etat de 2012", "Coup d\'Etat du 18 aout 2020", "Coup d\'Etat de 2021", "Coup d\'Etat de 2015"]', 1, 'hard'],
  ['Politique', 'Quelle organisation regionale a suspendu le Niger apres le coup d\'Etat de juillet 2023 ?', '["Union Africaine", "CEDEAO", "SADC", "CEEAC"]', 1, 'hard'],
  ['Politique', 'Quel pays de la region des Grands Lacs a connu un genocide en 1994 faisant environ 800 000 morts ?', '["Burundi", "Ouganda", "Rwanda", "RDC"]', 2, 'easy'],
  ['Politique', 'Quel est le nom de l\'institution de la Communaute d\'Afrique de l\'Est (EAC) qui siege a Arusha et sert de cour de justice regionale ?', '["Cour africaine des droits de l\'homme", "Cour de justice de l\'EAC", "Tribunal de la SADC", "Cour de la CEDEAO"]', 1, 'hard'],

  // --- Additional governance and politics ---
  ['Politique', 'Quel est le nom du programme de decentralisation inscrit dans la Constitution de la RDC qui prevoit la retrocession de 40% des recettes nationales aux provinces ?', '["Caisse de perequation", "Retrocession constitutionnelle", "Fonds de decentralisation", "Budget provincial autonome"]', 1, 'hard'],
  ['Politique', 'Quel leader africain a preside le premier sommet de l\'Organisation de l\'Unite Africaine en 1963 ?', '["Kwame Nkrumah", "Haile Selassie", "Julius Nyerere", "Gamal Abdel Nasser"]', 1, 'hard'],
  ['Politique', 'Quel est le nom de la doctrine politique qui defend le droit des peuples colonises a l\'autodetermination et a l\'independance ?', '["Imperialisme", "Nationalisme", "Droit des peuples a disposer d\'eux-memes (autodetermination)", "Colonialisme"]', 2, 'medium'],
  ['Politique', 'Quel pays africain a adopte une constitution federale divisant le pays en 36 Etats et un Territoire de la capitale federale ?', '["Ethiopie", "Nigeria", "Afrique du Sud", "Kenya"]', 1, 'hard'],
  ['Politique', 'Quelle organisation sous-regionale regroupe les pays de la Communaute Economique des Etats de l\'Afrique de l\'Ouest ?', '["SADC", "CEEAC", "CEDEAO", "COMESA"]', 2, 'medium'],
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
      message: `Batch 5: Added ${added} new questions, skipped ${skipped} duplicates`,
      total_questions: Number(totalRes.rows[0].c),
      categories: catCounts.rows,
    });
  } catch (err: any) {
    return errorResponse('Seed failed: ' + err.message, 500);
  }
}
