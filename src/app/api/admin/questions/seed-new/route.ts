import { successResponse, errorResponse, authenticateAdmin } from '../../../_lib/helpers';
import { getPool } from '../../../_lib/db';

// [category, question, options_json, correct_answer_index, difficulty]
type Q = [string, string, string, number, string];

const NEW_CATEGORIES = [
  'Sciences',
  'Chimie',
  'Politique Mondiale',
  'Mathématiques',
  'Technologie',
  'Santé',
];

const QUESTIONS: Q[] = [
  // ===================== SCIENCES (50 questions) =====================
  ['Sciences', 'Quelle est la vitesse de la lumière dans le vide ?', '["300 000 km/s", "150 000 km/s", "500 000 km/s", "1 000 000 km/s"]', 0, 'medium'],
  ['Sciences', 'Quel est l\'élément le plus abondant dans l\'univers ?', '["Oxygène", "Carbone", "Hydrogène", "Hélium"]', 2, 'medium'],
  ['Sciences', 'Quelle est la planète la plus proche du Soleil ?', '["Vénus", "Mercure", "Mars", "Terre"]', 1, 'easy'],
  ['Sciences', 'Combien d\'os le corps humain adulte possède-t-il ?', '["186", "206", "226", "256"]', 1, 'medium'],
  ['Sciences', 'Quel est le plus grand organe du corps humain ?', '["Foie", "Cerveau", "Peau", "Intestin grêle"]', 2, 'easy'],
  ['Sciences', 'Quelle est la formule chimique de l\'eau ?', '["H2O", "CO2", "NaCl", "O2"]', 0, 'easy'],
  ['Sciences', 'Quel scientifique a formulé la théorie de la relativité ?', '["Newton", "Einstein", "Bohr", "Hawking"]', 1, 'easy'],
  ['Sciences', 'Combien de chromosomes possède une cellule humaine ?', '["23", "44", "46", "48"]', 2, 'medium'],
  ['Sciences', 'Quel gaz les plantes absorbent-elles pendant la photosynthèse ?', '["Oxygène", "Azote", "Dioxyde de carbone", "Hydrogène"]', 2, 'easy'],
  ['Sciences', 'Quelle est la température du zéro absolu en Celsius ?', '["0°C", "-100°C", "-273,15°C", "-459°C"]', 2, 'hard'],
  ['Sciences', 'Quel est le nom de la force qui maintient les planètes en orbite ?', '["Force électromagnétique", "Force nucléaire", "Gravité", "Force centrifuge"]', 2, 'easy'],
  ['Sciences', 'Quel type de cellule sanguine combat les infections ?', '["Globules rouges", "Plaquettes", "Globules blancs", "Plasma"]', 2, 'medium'],
  ['Sciences', 'Quelle est la distance moyenne de la Terre au Soleil ?', '["50 millions km", "100 millions km", "150 millions km", "200 millions km"]', 2, 'hard'],
  ['Sciences', 'Quel est le métal le plus conducteur d\'électricité ?', '["Cuivre", "Or", "Argent", "Aluminium"]', 2, 'hard'],
  ['Sciences', 'Quel est le nom du processus par lequel une cellule se divise en deux ?', '["Mitose", "Méiose", "Osmose", "Symbiose"]', 0, 'medium'],
  ['Sciences', 'Quelle particule subatomique a une charge positive ?', '["Électron", "Neutron", "Proton", "Photon"]', 2, 'medium'],
  ['Sciences', 'Quel est l\'acide présent dans l\'estomac humain ?', '["Acide sulfurique", "Acide chlorhydrique", "Acide citrique", "Acide acétique"]', 1, 'hard'],
  ['Sciences', 'Combien de temps met la lumière du Soleil pour atteindre la Terre ?', '["1 minute", "4 minutes", "8 minutes", "15 minutes"]', 2, 'hard'],
  ['Sciences', 'Quel est le plus petit os du corps humain ?', '["Rotule", "Étrier (dans l\'oreille)", "Phalange", "Coccyx"]', 1, 'hard'],
  ['Sciences', 'Quel phénomène explique pourquoi le ciel est bleu ?', '["Réfraction", "Diffusion de Rayleigh", "Réflexion", "Absorption"]', 1, 'hard'],
  ['Sciences', 'Quelle est la galaxie la plus proche de la Voie lactée ?', '["Andromède", "Triangulum", "Grand Nuage de Magellan", "Centaurus A"]', 0, 'medium'],
  ['Sciences', 'Quel est le nombre d\'Avogadro ?', '["6,022 × 10²³", "3,14 × 10⁸", "9,81 × 10¹⁰", "1,602 × 10⁻¹⁹"]', 0, 'hard'],
  ['Sciences', 'Quel organe produit l\'insuline ?', '["Foie", "Reins", "Pancréas", "Rate"]', 2, 'medium'],
  ['Sciences', 'Quelle est la planète la plus grande du système solaire ?', '["Saturne", "Jupiter", "Neptune", "Uranus"]', 1, 'easy'],
  ['Sciences', 'Quel est le processus de transformation d\'un liquide en gaz ?', '["Condensation", "Sublimation", "Évaporation", "Fusion"]', 2, 'medium'],
  ['Sciences', 'Combien de planètes composent le système solaire ?', '["7", "8", "9", "10"]', 1, 'easy'],
  ['Sciences', 'Quel est le gaz le plus abondant dans l\'atmosphère terrestre ?', '["Oxygène", "Azote", "Dioxyde de carbone", "Argon"]', 1, 'medium'],
  ['Sciences', 'Quel est le nom de la couche de l\'atmosphère qui contient la couche d\'ozone ?', '["Troposphère", "Stratosphère", "Mésosphère", "Thermosphère"]', 1, 'hard'],
  ['Sciences', 'Quel type de roche est formé par le refroidissement du magma ?', '["Sédimentaire", "Métamorphique", "Ignée/Magmatique", "Calcaire"]', 2, 'medium'],
  ['Sciences', 'Quelle est la durée d\'une année-lumière en distance ?', '["9 460 milliards km", "300 000 km", "150 millions km", "1 milliard km"]', 0, 'hard'],
  ['Sciences', 'Quel est le pH d\'une solution neutre ?', '["0", "5", "7", "14"]', 2, 'medium'],
  ['Sciences', 'Quel scientifique a découvert la pénicilline ?', '["Pasteur", "Fleming", "Koch", "Jenner"]', 1, 'medium'],
  ['Sciences', 'Quelle est la loi de Newton qui dit que F = ma ?', '["Première loi", "Deuxième loi", "Troisième loi", "Loi de gravitation"]', 1, 'hard'],
  ['Sciences', 'Quel est le nom du satellite naturel de la Terre ?', '["Luna", "La Lune", "Phobos", "Titan"]', 1, 'easy'],
  ['Sciences', 'Quel phénomène naturel est mesuré par l\'échelle de Richter ?', '["Tornades", "Tsunamis", "Séismes", "Ouragans"]', 2, 'medium'],
  ['Sciences', 'Quel est le type de liaison chimique dans le sel de table (NaCl) ?', '["Covalente", "Ionique", "Métallique", "Van der Waals"]', 1, 'hard'],
  ['Sciences', 'Combien de valves possède le cœur humain ?', '["2", "3", "4", "5"]', 2, 'hard'],
  ['Sciences', 'Quel est le point d\'ébullition de l\'eau au niveau de la mer ?', '["90°C", "95°C", "100°C", "110°C"]', 2, 'easy'],
  ['Sciences', 'Quelle est la plus petite unité de la matière qui conserve les propriétés d\'un élément ?', '["Molécule", "Atome", "Proton", "Cellule"]', 1, 'medium'],
  ['Sciences', 'Quel organe filtre le sang dans le corps humain ?', '["Foie", "Reins", "Poumons", "Rate"]', 1, 'medium'],
  ['Sciences', 'Quelle est la planète connue pour ses anneaux visibles ?', '["Jupiter", "Neptune", "Saturne", "Uranus"]', 2, 'easy'],
  ['Sciences', 'Quel est le processus par lequel les organismes vivants maintiennent un environnement interne stable ?', '["Métabolisme", "Homéostasie", "Photosynthèse", "Respiration"]', 1, 'hard'],
  ['Sciences', 'Quelle est la vitesse du son dans l\'air à 20°C environ ?', '["100 m/s", "343 m/s", "500 m/s", "1 000 m/s"]', 1, 'hard'],
  ['Sciences', 'Quel est le nom de la théorie expliquant le mouvement des continents ?', '["Théorie du Big Bang", "Tectonique des plaques", "Dérive des continents", "Expansion océanique"]', 1, 'medium'],
  ['Sciences', 'Quelle est la molécule qui porte l\'information génétique ?', '["ARN", "ADN", "ATP", "ADP"]', 1, 'medium'],
  ['Sciences', 'Quel est l\'élément chimique dont le symbole est Fe ?', '["Fluor", "Francium", "Fer", "Fermium"]', 2, 'medium'],
  ['Sciences', 'Combien de litres de sang le corps humain contient-il environ ?', '["3 litres", "5 litres", "8 litres", "10 litres"]', 1, 'hard'],
  ['Sciences', 'Quel est le nom de la force qui s\'oppose au mouvement dans un fluide ?', '["Gravité", "Frottement/Traînée", "Poussée", "Tension"]', 1, 'hard'],
  ['Sciences', 'Quelle est la constante gravitationnelle universelle environ ?', '["6,67 × 10⁻¹¹ N⋅m²/kg²", "9,81 m/s²", "3 × 10⁸ m/s", "1,38 × 10⁻²³ J/K"]', 0, 'hard'],
  ['Sciences', 'Quel est le nom du phénomène où la lumière change de direction en passant d\'un milieu à un autre ?', '["Diffraction", "Réfraction", "Réflexion", "Polarisation"]', 1, 'hard'],

  // ===================== CHIMIE (50 questions) =====================
  ['Chimie', 'Combien d\'éléments le tableau périodique contient-il actuellement ?', '["108", "112", "118", "120"]', 2, 'medium'],
  ['Chimie', 'Quel est le symbole chimique de l\'or ?', '["Or", "Au", "Ag", "Go"]', 1, 'easy'],
  ['Chimie', 'Quel est le numéro atomique de l\'hydrogène ?', '["0", "1", "2", "3"]', 1, 'easy'],
  ['Chimie', 'Quel type de réaction libère de l\'énergie ?', '["Endothermique", "Exothermique", "Isotherme", "Adiabatique"]', 1, 'medium'],
  ['Chimie', 'Quel est le gaz produit lors de la réaction entre un acide et un carbonate ?', '["Oxygène", "Hydrogène", "Dioxyde de carbone", "Azote"]', 2, 'medium'],
  ['Chimie', 'Quel élément a le symbole Na ?', '["Nickel", "Néon", "Sodium", "Azote"]', 2, 'easy'],
  ['Chimie', 'Combien d\'électrons peut contenir la première couche électronique ?', '["1", "2", "6", "8"]', 1, 'hard'],
  ['Chimie', 'Quel est le nom de la réaction entre un acide et une base ?', '["Oxydation", "Réduction", "Neutralisation", "Combustion"]', 2, 'medium'],
  ['Chimie', 'Quel est l\'état de la matière qui n\'a ni forme ni volume fixe ?', '["Solide", "Liquide", "Gaz", "Plasma"]', 2, 'easy'],
  ['Chimie', 'Quel est le symbole chimique du mercure ?', '["Me", "Mr", "Hg", "Mc"]', 2, 'hard'],
  ['Chimie', 'Quel est le nombre de masse d\'un atome ?', '["Nombre de protons", "Nombre d\'électrons", "Protons + neutrons", "Protons + électrons"]', 2, 'hard'],
  ['Chimie', 'Quel acide est contenu dans le vinaigre ?', '["Acide citrique", "Acide chlorhydrique", "Acide acétique", "Acide sulfurique"]', 2, 'medium'],
  ['Chimie', 'Quel gaz est nécessaire à la combustion ?', '["Azote", "Hydrogène", "Oxygène", "Hélium"]', 2, 'easy'],
  ['Chimie', 'Quelle est la formule chimique du glucose ?', '["C6H12O6", "C2H5OH", "CH4", "C12H22O11"]', 0, 'hard'],
  ['Chimie', 'Quel élément chimique est liquide à température ambiante (hors mercure) ?', '["Gallium", "Brome", "Césium", "Francium"]', 1, 'hard'],
  ['Chimie', 'Quel est le symbole chimique du potassium ?', '["Po", "Pt", "K", "Ka"]', 2, 'medium'],
  ['Chimie', 'Quelle est la formule du méthane ?', '["CO2", "CH4", "C2H6", "NH3"]', 1, 'medium'],
  ['Chimie', 'Quel est le nom du changement d\'état du solide au gaz sans passer par le liquide ?', '["Évaporation", "Condensation", "Sublimation", "Fusion"]', 2, 'hard'],
  ['Chimie', 'Quel est le pH d\'une solution fortement acide ?', '["0-2", "5-6", "7", "12-14"]', 0, 'medium'],
  ['Chimie', 'Quel métal est le plus réactif ?', '["Or", "Cuivre", "Fer", "Potassium"]', 3, 'hard'],
  ['Chimie', 'Quel est le nom de la colonne verticale du tableau périodique ?', '["Période", "Groupe/Famille", "Série", "Bloc"]', 1, 'medium'],
  ['Chimie', 'Quel est le symbole chimique du plomb ?', '["Pl", "Pb", "Pd", "Po"]', 1, 'hard'],
  ['Chimie', 'Quel type de liaison se forme entre deux atomes qui partagent des électrons ?', '["Ionique", "Covalente", "Métallique", "Hydrogène"]', 1, 'medium'],
  ['Chimie', 'Quel est le nom de la réaction qui implique un transfert d\'électrons ?', '["Neutralisation", "Précipitation", "Oxydoréduction", "Polymérisation"]', 2, 'hard'],
  ['Chimie', 'Quel gaz est produit par l\'électrolyse de l\'eau à la cathode ?', '["Oxygène", "Hydrogène", "Chlore", "Ozone"]', 1, 'hard'],
  ['Chimie', 'Quel est l\'élément le plus électronégatif ?', '["Oxygène", "Chlore", "Fluor", "Azote"]', 2, 'hard'],
  ['Chimie', 'Quelle est la formule chimique du sel de table ?', '["KCl", "NaCl", "CaCl2", "MgCl2"]', 1, 'easy'],
  ['Chimie', 'Quel est le nom du processus de séparation d\'un mélange par ébullition ?', '["Filtration", "Distillation", "Décantation", "Chromatographie"]', 1, 'medium'],
  ['Chimie', 'Quel élément est le principal composant de l\'acier ?', '["Aluminium", "Cuivre", "Fer", "Zinc"]', 2, 'easy'],
  ['Chimie', 'Quel est le nombre quantique principal de la deuxième couche électronique ?', '["1", "2", "3", "4"]', 1, 'hard'],
  ['Chimie', 'Quelle est la masse molaire de l\'eau (H2O) ?', '["16 g/mol", "18 g/mol", "20 g/mol", "32 g/mol"]', 1, 'hard'],
  ['Chimie', 'Quel est le nom de l\'alliage de cuivre et d\'étain ?', '["Laiton", "Bronze", "Acier", "Inox"]', 1, 'medium'],
  ['Chimie', 'Quel gaz est responsable de l\'effet de serre ?', '["Oxygène", "Azote", "Dioxyde de carbone", "Hydrogène"]', 2, 'easy'],
  ['Chimie', 'Quel est le symbole chimique du tungstène ?', '["Tu", "Tg", "W", "Wt"]', 2, 'hard'],
  ['Chimie', 'Quel type d\'isomère a la même formule mais un arrangement spatial différent ?', '["Isomère de chaîne", "Isomère de position", "Stéréoisomère", "Isomère de fonction"]', 2, 'hard'],
  ['Chimie', 'Quel est le nom de la réaction d\'un métal avec l\'oxygène ?', '["Réduction", "Oxydation", "Hydratation", "Fermentation"]', 1, 'medium'],
  ['Chimie', 'Quelle est la concentration en ions H+ d\'une solution de pH 3 ?', '["10⁻³ mol/L", "10⁻⁷ mol/L", "10³ mol/L", "3 mol/L"]', 0, 'hard'],
  ['Chimie', 'Quel savant a classé les éléments par numéro atomique croissant ?', '["Mendeleïev", "Moseley", "Dalton", "Lavoisier"]', 1, 'hard'],
  ['Chimie', 'Quel est le nom de la famille des éléments de la colonne 18 ?', '["Halogènes", "Alcalins", "Gaz nobles", "Métaux de transition"]', 2, 'medium'],
  ['Chimie', 'Quel est le symbole chimique de l\'argent ?', '["Ar", "Ag", "Au", "Al"]', 1, 'medium'],
  ['Chimie', 'Quelle est la formule chimique de l\'ammoniac ?', '["NO2", "N2O", "NH3", "HNO3"]', 2, 'medium'],
  ['Chimie', 'Quel catalyseur biologique accélère les réactions dans le corps ?', '["Hormone", "Enzyme", "Vitamine", "Protéine"]', 1, 'medium'],
  ['Chimie', 'Quel est le nom du processus de décomposition d\'un composé par l\'électricité ?', '["Thermolyse", "Électrolyse", "Photolyse", "Hydrolyse"]', 1, 'medium'],
  ['Chimie', 'Quelle est la formule chimique de l\'acide sulfurique ?', '["HCl", "H2SO4", "HNO3", "H3PO4"]', 1, 'hard'],
  ['Chimie', 'Quel élément a le symbole Sn ?', '["Soufre", "Sélénium", "Étain", "Antimoine"]', 2, 'hard'],
  ['Chimie', 'Quel est le principe de conservation dans une réaction chimique ?', '["Conservation de l\'énergie", "Conservation de la masse", "Conservation de la charge", "Toutes ces réponses"]', 3, 'medium'],
  ['Chimie', 'Quel type de mélange est homogène et transparent ?', '["Suspension", "Émulsion", "Solution", "Colloïde"]', 2, 'medium'],
  ['Chimie', 'Quel est le polymère naturel le plus abondant sur Terre ?', '["Protéine", "ADN", "Cellulose", "Amidon"]', 2, 'hard'],
  ['Chimie', 'Quel est le nom de la réaction entre un alcool et un acide carboxylique ?', '["Saponification", "Estérification", "Polymérisation", "Hydrogénation"]', 1, 'hard'],
  ['Chimie', 'Quel est le nombre d\'électrons dans un atome neutre de carbone ?', '["4", "6", "8", "12"]', 1, 'medium'],

  // ===================== POLITIQUE MONDIALE (50 questions) =====================
  ['Politique Mondiale', 'Quel est le siège des Nations Unies ?', '["Genève", "New York", "Paris", "La Haye"]', 1, 'easy'],
  ['Politique Mondiale', 'Combien de membres permanents siègent au Conseil de sécurité de l\'ONU ?', '["3", "5", "7", "10"]', 1, 'easy'],
  ['Politique Mondiale', 'Quel pays a le plus grand nombre d\'habitants au monde ?', '["États-Unis", "Inde", "Chine", "Indonésie"]', 1, 'easy'],
  ['Politique Mondiale', 'Quelle organisation internationale gère le commerce mondial ?', '["FMI", "OMC", "OMS", "UNESCO"]', 1, 'medium'],
  ['Politique Mondiale', 'En quelle année l\'Union européenne a-t-elle été créée (traité de Maastricht) ?', '["1989", "1992", "1995", "2000"]', 1, 'hard'],
  ['Politique Mondiale', 'Quel pays a quitté l\'Union européenne en 2020 ?', '["Norvège", "Suisse", "Royaume-Uni", "Islande"]', 2, 'easy'],
  ['Politique Mondiale', 'Quel est le nom du traité qui a mis fin à la Première Guerre mondiale ?', '["Traité de Paris", "Traité de Versailles", "Traité de Westphalie", "Traité de Vienne"]', 1, 'medium'],
  ['Politique Mondiale', 'Combien de pays sont membres de l\'Union africaine ?', '["44", "50", "55", "60"]', 2, 'medium'],
  ['Politique Mondiale', 'Quel est le nom du tribunal international qui juge les crimes de guerre ?', '["Cour internationale de Justice", "Cour pénale internationale", "Tribunal de Nuremberg", "Cour européenne"]', 1, 'medium'],
  ['Politique Mondiale', 'Où se trouve le siège de la Cour pénale internationale ?', '["New York", "Genève", "La Haye", "Bruxelles"]', 2, 'hard'],
  ['Politique Mondiale', 'Quel est le nom du groupe des économies les plus industrialisées ?', '["G5", "G7", "G10", "G15"]', 1, 'medium'],
  ['Politique Mondiale', 'Quel accord international vise à limiter le réchauffement climatique ?', '["Protocole de Kyoto", "Accord de Paris", "Convention de Bâle", "Traité de Montréal"]', 1, 'medium'],
  ['Politique Mondiale', 'En quelle année l\'apartheid a-t-il pris fin en Afrique du Sud ?', '["1988", "1990", "1994", "1996"]', 2, 'medium'],
  ['Politique Mondiale', 'Qui a été le premier secrétaire général africain de l\'ONU ?', '["Boutros Boutros-Ghali", "Kofi Annan", "Ban Ki-moon", "Dag Hammarskjöld"]', 1, 'hard'],
  ['Politique Mondiale', 'Quel est le nom de l\'alliance militaire occidentale créée en 1949 ?', '["Pacte de Varsovie", "OTAN", "SEATO", "ANZUS"]', 1, 'easy'],
  ['Politique Mondiale', 'Combien de pays composent le BRICS actuellement ?', '["5", "7", "9", "11"]', 2, 'hard'],
  ['Politique Mondiale', 'Quel est le système politique de la Chine ?', '["Démocratie", "Monarchie", "République populaire à parti unique", "Fédération"]', 2, 'medium'],
  ['Politique Mondiale', 'Quel événement a marqué la fin de la Guerre froide ?', '["Crise de Cuba", "Chute du mur de Berlin", "Guerre du Vietnam", "Dissolution de l\'URSS"]', 1, 'medium'],
  ['Politique Mondiale', 'En quelle année le mur de Berlin est-il tombé ?', '["1987", "1989", "1991", "1993"]', 1, 'easy'],
  ['Politique Mondiale', 'Quel pays détient le droit de veto au Conseil de sécurité mais n\'est PAS un des 5 permanents ?', '["Allemagne", "Japon", "Aucun", "Inde"]', 2, 'hard'],
  ['Politique Mondiale', 'Quel est le nom de l\'organisation des pays exportateurs de pétrole ?', '["OTAN", "OPEP", "OMC", "OCDE"]', 1, 'medium'],
  ['Politique Mondiale', 'Quel pays est le plus grand en superficie au monde ?', '["Canada", "Chine", "États-Unis", "Russie"]', 3, 'easy'],
  ['Politique Mondiale', 'Quelle organisation internationale s\'occupe de la santé mondiale ?', '["UNICEF", "OMS", "FAO", "PNUD"]', 1, 'easy'],
  ['Politique Mondiale', 'Quel conflit a duré de 1955 à 1975 en Asie du Sud-Est ?', '["Guerre de Corée", "Guerre du Vietnam", "Guerre du Golfe", "Guerre sino-japonaise"]', 1, 'medium'],
  ['Politique Mondiale', 'Quel est le nom du programme de développement durable de l\'ONU pour 2030 ?', '["Objectifs du Millénaire", "ODD/Agenda 2030", "Vision 2050", "Plan Marshall mondial"]', 1, 'hard'],
  ['Politique Mondiale', 'Quel pays est le plus grand contributeur financier de l\'ONU ?', '["Chine", "Japon", "États-Unis", "Allemagne"]', 2, 'hard'],
  ['Politique Mondiale', 'Combien de pays sont membres de l\'ONU en 2024 ?', '["180", "193", "200", "210"]', 1, 'hard'],
  ['Politique Mondiale', 'Quel est le nom du conflit israélo-palestinien qui a éclaté en 1948 ?', '["Guerre des Six Jours", "Guerre du Kippour", "Première guerre israélo-arabe", "Intifada"]', 2, 'hard'],
  ['Politique Mondiale', 'Quel dirigeant sud-africain a reçu le prix Nobel de la paix en 1993 ?', '["Desmond Tutu", "Nelson Mandela", "F.W. de Klerk", "Mandela et de Klerk"]', 3, 'medium'],
  ['Politique Mondiale', 'Quel est le nom du bloc économique d\'Amérique du Nord ?', '["MERCOSUR", "ALENA/ACEUM", "CARICOM", "ALBA"]', 1, 'medium'],
  ['Politique Mondiale', 'Quel pays a le plus grand PIB nominal au monde ?', '["Chine", "Japon", "Allemagne", "États-Unis"]', 3, 'medium'],
  ['Politique Mondiale', 'En quelle année l\'ONU a-t-elle été fondée ?', '["1919", "1942", "1945", "1948"]', 2, 'medium'],
  ['Politique Mondiale', 'Quel est le nom de la déclaration adoptée par l\'ONU en 1948 ?', '["Charte de l\'ONU", "Déclaration universelle des droits de l\'homme", "Convention de Genève", "Pacte de l\'Atlantique"]', 1, 'medium'],
  ['Politique Mondiale', 'Quel pays a lancé le programme spatial qui a envoyé le premier homme dans l\'espace ?', '["États-Unis", "URSS", "Chine", "France"]', 1, 'medium'],
  ['Politique Mondiale', 'Quel est le nom de l\'organisation régionale d\'Asie du Sud-Est ?', '["SAARC", "ASEAN", "APEC", "SCO"]', 1, 'hard'],
  ['Politique Mondiale', 'Quelle guerre a commencé en 2022 en Europe ?', '["Guerre de Géorgie", "Guerre de Crimée", "Guerre en Ukraine", "Guerre des Balkans"]', 2, 'easy'],
  ['Politique Mondiale', 'Quel est le nom du sommet annuel des leaders africains ?', '["G20 Afrique", "Sommet de l\'Union africaine", "Forum Afrique", "Conférence panafricaine"]', 1, 'medium'],
  ['Politique Mondiale', 'Quel pays africain n\'a jamais été colonisé (avec le Libéria) ?', '["Ghana", "Éthiopie", "Kenya", "Égypte"]', 1, 'hard'],
  ['Politique Mondiale', 'Quel est le premier pays africain à avoir obtenu son indépendance en Afrique subsaharienne ?', '["Nigeria", "Ghana", "Sénégal", "Congo"]', 1, 'hard'],
  ['Politique Mondiale', 'Quel est le rôle principal du FMI ?', '["Financer les guerres", "Stabilité financière mondiale", "Commerce international", "Droits de l\'homme"]', 1, 'medium'],
  ['Politique Mondiale', 'Quel est le nom du plus ancien conflit territorial non résolu en Afrique ?', '["Sahara occidental", "Somaliland", "Casamance", "Cabinda"]', 0, 'hard'],
  ['Politique Mondiale', 'Quelle monnaie est utilisée dans la zone euro ?', '["Dollar", "Livre", "Euro", "Franc"]', 2, 'easy'],
  ['Politique Mondiale', 'Combien de pays utilisent l\'euro comme monnaie officielle ?', '["15", "17", "20", "27"]', 2, 'hard'],
  ['Politique Mondiale', 'Quel est le nom de l\'accord commercial entre l\'UE et les pays ACP ?', '["Accord de Cotonou", "Accord de Lomé", "Accord de libre-échange", "Traité de Rome"]', 0, 'hard'],
  ['Politique Mondiale', 'Quel est le siège de l\'Union africaine ?', '["Le Caire", "Nairobi", "Addis-Abeba", "Pretoria"]', 2, 'medium'],
  ['Politique Mondiale', 'Quel président américain a lancé le Plan Marshall pour reconstruire l\'Europe ?', '["Roosevelt", "Truman", "Eisenhower", "Kennedy"]', 1, 'hard'],
  ['Politique Mondiale', 'Quel est le nom de la politique d\'ouverture économique de la Chine ?', '["Grande marche", "Réforme et ouverture", "Révolution culturelle", "Grand bond en avant"]', 1, 'hard'],
  ['Politique Mondiale', 'Quel organisme de l\'ONU s\'occupe des réfugiés ?', '["UNICEF", "HCR/UNHCR", "OMS", "PAM"]', 1, 'medium'],
  ['Politique Mondiale', 'Quelle est la langue officielle la plus parlée dans le monde ?', '["Anglais", "Mandarin", "Espagnol", "Hindi"]', 1, 'medium'],
  ['Politique Mondiale', 'Quel est le continent le plus peuplé ?', '["Afrique", "Europe", "Amérique", "Asie"]', 3, 'easy'],

  // ===================== MATHÉMATIQUES (50 questions) =====================
  ['Mathématiques', 'Quelle est la valeur de Pi (π) arrondie à deux décimales ?', '["3,12", "3,14", "3,16", "3,18"]', 1, 'easy'],
  ['Mathématiques', 'Quel est le résultat de 2⁸ ?', '["64", "128", "256", "512"]', 2, 'medium'],
  ['Mathématiques', 'Quelle est la racine carrée de 144 ?', '["11", "12", "13", "14"]', 1, 'easy'],
  ['Mathématiques', 'Combien de faces a un dodécaèdre ?', '["8", "10", "12", "20"]', 2, 'hard'],
  ['Mathématiques', 'Quel est le PGCD de 48 et 36 ?', '["6", "8", "12", "18"]', 2, 'medium'],
  ['Mathématiques', 'Quelle est la somme des angles d\'un triangle ?', '["90°", "180°", "270°", "360°"]', 1, 'easy'],
  ['Mathématiques', 'Quel est le nom d\'un polygone à 8 côtés ?', '["Hexagone", "Heptagone", "Octogone", "Décagone"]', 2, 'medium'],
  ['Mathématiques', 'Quelle est la formule de l\'aire d\'un cercle ?', '["2πr", "πr²", "πd", "4πr²"]', 1, 'medium'],
  ['Mathématiques', 'Quel est le prochain nombre premier après 29 ?', '["30", "31", "33", "37"]', 1, 'medium'],
  ['Mathématiques', 'Quelle est la valeur de la factorielle de 6 (6!) ?', '["120", "360", "720", "5040"]', 2, 'hard'],
  ['Mathématiques', 'Quel est le résultat de log₁₀(1000) ?', '["2", "3", "4", "10"]', 1, 'hard'],
  ['Mathématiques', 'Combien de diagonales possède un hexagone ?', '["6", "9", "12", "15"]', 1, 'hard'],
  ['Mathématiques', 'Quel est le volume d\'une sphère de rayon r ?', '["πr²", "4πr²", "4/3 πr³", "2πr³"]', 2, 'hard'],
  ['Mathématiques', 'Quelle est la somme des 10 premiers entiers positifs ?', '["45", "50", "55", "60"]', 2, 'medium'],
  ['Mathématiques', 'Quel nombre est à la fois carré parfait et cube parfait (après 1) ?', '["8", "16", "27", "64"]', 3, 'hard'],
  ['Mathématiques', 'Quel est le théorème qui relie les côtés d\'un triangle rectangle ?', '["Théorème de Thalès", "Théorème de Pythagore", "Théorème de Fermat", "Théorème d\'Euler"]', 1, 'easy'],
  ['Mathématiques', 'Quelle est la dérivée de x³ ?', '["x²", "2x²", "3x²", "3x"]', 2, 'hard'],
  ['Mathématiques', 'Quel est le résultat de la somme 1/2 + 1/3 + 1/6 ?', '["1/2", "2/3", "5/6", "1"]', 3, 'medium'],
  ['Mathématiques', 'Combien y a-t-il de nombres premiers entre 1 et 20 ?', '["6", "7", "8", "9"]', 2, 'hard'],
  ['Mathématiques', 'Quel est le nom d\'une suite où chaque terme est la somme des deux précédents ?', '["Suite arithmétique", "Suite géométrique", "Suite de Fibonacci", "Suite harmonique"]', 2, 'medium'],
  ['Mathématiques', 'Quelle est la valeur de sin(90°) ?', '["0", "0,5", "1", "√2/2"]', 2, 'medium'],
  ['Mathématiques', 'Combien de zéros a un milliard ?', '["6", "7", "8", "9"]', 3, 'medium'],
  ['Mathématiques', 'Quel est le périmètre d\'un cercle de rayon 7 cm ? (π ≈ 22/7)', '["22 cm", "44 cm", "88 cm", "154 cm"]', 1, 'medium'],
  ['Mathématiques', 'Quelle opération est l\'inverse de l\'exponentiation ?', '["Division", "Soustraction", "Logarithme", "Racine carrée"]', 2, 'hard'],
  ['Mathématiques', 'Quel est le résultat de (-3)² ?', '["-9", "-6", "6", "9"]', 3, 'easy'],
  ['Mathématiques', 'Combien de faces a un icosaèdre ?', '["10", "12", "16", "20"]', 3, 'hard'],
  ['Mathématiques', 'Quelle est l\'intégrale de 2x dx ?', '["x²", "x² + C", "2x² + C", "x + C"]', 1, 'hard'],
  ['Mathématiques', 'Quel est le résultat de 15! / 13! ?', '["15", "30", "210", "420"]', 2, 'hard'],
  ['Mathématiques', 'Quelle est la médiane de la série : 3, 7, 9, 12, 15 ?', '["7", "9", "10", "12"]', 1, 'medium'],
  ['Mathématiques', 'Quel est le discriminant de l\'équation x² - 5x + 6 = 0 ?', '["0", "1", "4", "25"]', 1, 'hard'],
  ['Mathématiques', 'Combien de sommets a un cube ?', '["4", "6", "8", "12"]', 2, 'easy'],
  ['Mathématiques', 'Quel est le PPCM de 4 et 6 ?', '["8", "10", "12", "24"]', 2, 'medium'],
  ['Mathématiques', 'Quelle est la somme des angles intérieurs d\'un quadrilatère ?', '["180°", "270°", "360°", "540°"]', 2, 'easy'],
  ['Mathématiques', 'Quel est le résultat de √(81) + √(49) ?', '["14", "15", "16", "17"]', 2, 'easy'],
  ['Mathématiques', 'Quelle est la probabilité d\'obtenir un 6 en lançant un dé ?', '["1/3", "1/4", "1/6", "1/12"]', 2, 'easy'],
  ['Mathématiques', 'Quel est le terme général d\'une suite arithmétique de premier terme 3 et raison 4 ?', '["3n + 4", "4n - 1", "4n + 3", "3 + 4n"]', 1, 'hard'],
  ['Mathématiques', 'Combien de combinaisons de 2 éléments peut-on faire avec 5 éléments (C(5,2)) ?', '["5", "10", "15", "20"]', 1, 'hard'],
  ['Mathématiques', 'Quel est le résultat de cos(0°) ?', '["0", "0,5", "1", "-1"]', 2, 'medium'],
  ['Mathématiques', 'Quelle est la propriété d\'une matrice dont le déterminant est zéro ?', '["Inversible", "Singulière/Non inversible", "Diagonale", "Symétrique"]', 1, 'hard'],
  ['Mathématiques', 'Quel est le 7e terme de la suite de Fibonacci (1,1,2,3,5,...) ?', '["8", "13", "21", "34"]', 1, 'hard'],
  ['Mathématiques', 'Quelle est l\'aire d\'un triangle de base 10 et hauteur 6 ?', '["16", "30", "60", "120"]', 1, 'easy'],
  ['Mathématiques', 'Quel est le pourcentage de 45 sur 180 ?', '["20%", "25%", "30%", "35%"]', 1, 'medium'],
  ['Mathématiques', 'Quelle est la solution de 3x + 7 = 22 ?', '["3", "4", "5", "6"]', 2, 'easy'],
  ['Mathématiques', 'Quel est le nombre d\'or (φ) approximativement ?', '["1,414", "1,618", "1,732", "2,236"]', 1, 'hard'],
  ['Mathématiques', 'Quel est le résultat de 3⁰ ?', '["0", "1", "3", "Indéfini"]', 1, 'easy'],
  ['Mathématiques', 'Quelle est la distance entre les points (0,0) et (3,4) ?', '["3", "4", "5", "7"]', 2, 'medium'],
  ['Mathématiques', 'Quel est le résultat de la série géométrique 1 + 2 + 4 + 8 + 16 ?', '["30", "31", "32", "33"]', 1, 'medium'],
  ['Mathématiques', 'Combien d\'arêtes possède un cube ?', '["6", "8", "10", "12"]', 3, 'medium'],
  ['Mathématiques', 'Quel mathématicien a prouvé le dernier théorème de Fermat en 1995 ?', '["Euler", "Gauss", "Andrew Wiles", "Riemann"]', 2, 'hard'],
  ['Mathématiques', 'Quel est le résultat de i² (i = nombre imaginaire) ?', '["1", "-1", "i", "0"]', 1, 'hard'],

  // ===================== TECHNOLOGIE (50 questions) =====================
  ['Technologie', 'Quel langage de programmation est principalement utilisé pour le web côté client ?', '["Python", "Java", "JavaScript", "C++"]', 2, 'medium'],
  ['Technologie', 'Que signifie l\'acronyme HTML ?', '["HyperText Markup Language", "High Tech Modern Language", "Hyper Transfer Mail Link", "Home Tool Markup Language"]', 0, 'easy'],
  ['Technologie', 'Quel est le système d\'exploitation mobile développé par Google ?', '["iOS", "Windows Mobile", "Android", "BlackBerry OS"]', 2, 'easy'],
  ['Technologie', 'Combien de bits composent un octet ?', '["4", "8", "16", "32"]', 1, 'easy'],
  ['Technologie', 'Quel est le nom du protocole utilisé pour les sites web sécurisés ?', '["HTTP", "FTP", "HTTPS", "SSH"]', 2, 'medium'],
  ['Technologie', 'Qui est le fondateur de Microsoft ?', '["Steve Jobs", "Bill Gates", "Mark Zuckerberg", "Jeff Bezos"]', 1, 'easy'],
  ['Technologie', 'Quel est le langage de programmation créé par Guido van Rossum ?', '["Java", "Ruby", "Python", "C#"]', 2, 'medium'],
  ['Technologie', 'Que signifie l\'acronyme AI/IA ?', '["Application Internet", "Intelligence Artificielle", "Interface Automatique", "Information Avancée"]', 1, 'easy'],
  ['Technologie', 'Quel est le nom du premier ordinateur électronique programmable ?', '["UNIVAC", "ENIAC", "EDVAC", "Colossus"]', 1, 'hard'],
  ['Technologie', 'Quelle entreprise a créé le premier iPhone ?', '["Samsung", "Nokia", "Apple", "Motorola"]', 2, 'easy'],
  ['Technologie', 'Quel est le nom du réseau mondial d\'ordinateurs interconnectés ?', '["Intranet", "Extranet", "Internet", "Ethernet"]', 2, 'easy'],
  ['Technologie', 'Quel est le système de base utilisé en informatique ?', '["Décimal", "Binaire", "Hexadécimal", "Octal"]', 1, 'medium'],
  ['Technologie', 'Que signifie CPU en informatique ?', '["Central Processing Unit", "Computer Personal Unit", "Central Program Utility", "Core Processing Unit"]', 0, 'medium'],
  ['Technologie', 'Quel est le nom de la technologie de chaîne de blocs ?', '["Cloud Computing", "Blockchain", "Big Data", "IoT"]', 1, 'medium'],
  ['Technologie', 'Quel est le langage de requête utilisé pour les bases de données relationnelles ?', '["HTML", "CSS", "SQL", "XML"]', 2, 'medium'],
  ['Technologie', 'Quelle est la capacité de stockage d\'un téraoctet ?', '["100 Go", "500 Go", "1 000 Go", "10 000 Go"]', 2, 'medium'],
  ['Technologie', 'Quel protocole est utilisé pour envoyer des emails ?', '["HTTP", "FTP", "SMTP", "TCP"]', 2, 'hard'],
  ['Technologie', 'Quel est le nom de l\'algorithme de chiffrement le plus utilisé pour le web ?', '["DES", "RSA", "AES", "MD5"]', 2, 'hard'],
  ['Technologie', 'Quel est le nom du système de positionnement par satellite ?', '["Wi-Fi", "Bluetooth", "GPS", "NFC"]', 2, 'easy'],
  ['Technologie', 'Quelle est la résolution d\'un écran 4K ?', '["1920×1080", "2560×1440", "3840×2160", "7680×4320"]', 2, 'hard'],
  ['Technologie', 'Quel est le nom du fondateur de Facebook/Meta ?', '["Jack Dorsey", "Mark Zuckerberg", "Elon Musk", "Larry Page"]', 1, 'easy'],
  ['Technologie', 'Quel type de mémoire perd ses données quand l\'ordinateur est éteint ?', '["ROM", "SSD", "RAM", "HDD"]', 2, 'medium'],
  ['Technologie', 'Quel est le nom du premier navigateur web populaire ?', '["Chrome", "Firefox", "Netscape Navigator", "Internet Explorer"]', 2, 'hard'],
  ['Technologie', 'Que signifie IoT ?', '["Internet of Things", "Input of Technology", "Integration of Tools", "Interface of Telecom"]', 0, 'medium'],
  ['Technologie', 'Quel est le langage de programmation utilisé pour le développement iOS ?', '["Java", "Kotlin", "Swift", "Python"]', 2, 'hard'],
  ['Technologie', 'Quelle technologie permet la communication sans fil à courte portée ?', '["Wi-Fi", "4G", "Bluetooth", "Satellite"]', 2, 'easy'],
  ['Technologie', 'Quel est le nom du modèle d\'IA développé par OpenAI ?', '["BERT", "GPT", "DALL-E", "LLaMA"]', 1, 'medium'],
  ['Technologie', 'Quel est le protocole de communication de base d\'Internet ?', '["HTTP", "TCP/IP", "DNS", "FTP"]', 1, 'hard'],
  ['Technologie', 'Quel est le nom de la première cryptomonnaie ?', '["Ethereum", "Litecoin", "Bitcoin", "Ripple"]', 2, 'easy'],
  ['Technologie', 'En quelle année le Bitcoin a-t-il été créé ?', '["2005", "2008", "2009", "2011"]', 2, 'hard'],
  ['Technologie', 'Quel est le nom du système d\'exploitation créé par Linus Torvalds ?', '["Windows", "macOS", "Linux", "Unix"]', 2, 'medium'],
  ['Technologie', 'Quelle technologie est utilisée pour les paiements sans contact ?', '["Bluetooth", "Wi-Fi", "NFC", "GPS"]', 2, 'medium'],
  ['Technologie', 'Quel est le nombre maximum d\'adresses IPv4 possibles ?', '["1 milliard", "2,1 milliards", "4,3 milliards", "8,5 milliards"]', 2, 'hard'],
  ['Technologie', 'Quel est le nom de la technique d\'apprentissage automatique inspirée du cerveau humain ?', '["Arbre de décision", "Réseau de neurones", "Régression linéaire", "K-moyennes"]', 1, 'hard'],
  ['Technologie', 'Quel est le format d\'image le plus utilisé sur le web ?', '["BMP", "TIFF", "JPEG/PNG", "RAW"]', 2, 'easy'],
  ['Technologie', 'Que signifie URL ?', '["Uniform Resource Locator", "Universal Reference Link", "Unified Resource Language", "User Request Locator"]', 0, 'medium'],
  ['Technologie', 'Quel est le cloud computing le plus utilisé au monde ?', '["Google Cloud", "Azure", "AWS", "IBM Cloud"]', 2, 'hard'],
  ['Technologie', 'Quel est le nom de l\'assistant vocal d\'Apple ?', '["Alexa", "Cortana", "Siri", "Google Assistant"]', 2, 'easy'],
  ['Technologie', 'Quel est le débit théorique de la 5G ?', '["100 Mbps", "1 Gbps", "10 Gbps", "100 Gbps"]', 2, 'hard'],
  ['Technologie', 'Quelle est la différence principale entre HTTP et HTTPS ?', '["Vitesse", "Chiffrement/Sécurité", "Compatibilité", "Coût"]', 1, 'medium'],
  ['Technologie', 'Quel est le nom du processus de conversion d\'un programme en code machine ?', '["Interprétation", "Compilation", "Exécution", "Débogage"]', 1, 'hard'],
  ['Technologie', 'Quel type d\'attaque informatique consiste à surcharger un serveur de requêtes ?', '["Phishing", "DDoS", "Ransomware", "Man-in-the-middle"]', 1, 'hard'],
  ['Technologie', 'Quel est le nom de la loi qui prédit le doublement des transistors tous les 2 ans ?', '["Loi de Murphy", "Loi de Moore", "Loi d\'Ohm", "Loi de Metcalfe"]', 1, 'hard'],
  ['Technologie', 'Quel est le format de fichier standard pour les documents portables ?', '["DOC", "TXT", "PDF", "RTF"]', 2, 'easy'],
  ['Technologie', 'Quel est le nom du co-fondateur d\'Apple avec Steve Jobs ?', '["Bill Gates", "Steve Wozniak", "Tim Cook", "Larry Ellison"]', 1, 'medium'],
  ['Technologie', 'Quelle est la technologie derrière les QR codes ?', '["Code-barres 2D", "NFC", "RFID", "Bluetooth"]', 0, 'medium'],
  ['Technologie', 'Quel est le nom du réseau social professionnel le plus populaire ?', '["Twitter", "Facebook", "LinkedIn", "Instagram"]', 2, 'easy'],
  ['Technologie', 'Quel est le nom de la technologie qui permet de créer des environnements virtuels immersifs ?', '["Réalité augmentée", "Réalité virtuelle", "Réalité mixte", "Holographie"]', 1, 'medium'],
  ['Technologie', 'Quel est le langage de programmation le plus ancien encore utilisé ?', '["C", "FORTRAN", "COBOL", "Pascal"]', 1, 'hard'],
  ['Technologie', 'Quel est le nom du système de gestion de versions créé par Linus Torvalds ?', '["SVN", "Mercurial", "Git", "CVS"]', 2, 'hard'],

  // ===================== SANTÉ (50 questions) =====================
  ['Santé', 'Combien de litres d\'eau faut-il boire par jour en moyenne ?', '["0,5 L", "1 L", "1,5 à 2 L", "3 L"]', 2, 'easy'],
  ['Santé', 'Quelle vitamine est produite par l\'exposition au soleil ?', '["Vitamine A", "Vitamine B12", "Vitamine C", "Vitamine D"]', 3, 'medium'],
  ['Santé', 'Quelle maladie est causée par le plasmodium transmis par les moustiques ?', '["Dengue", "Paludisme/Malaria", "Fièvre jaune", "Zika"]', 1, 'easy'],
  ['Santé', 'Quel est le groupe sanguin donneur universel ?', '["A+", "B+", "AB+", "O-"]', 3, 'medium'],
  ['Santé', 'Combien d\'heures de sommeil un adulte a-t-il besoin par nuit ?', '["4-5 heures", "6-7 heures", "7-9 heures", "10-12 heures"]', 2, 'easy'],
  ['Santé', 'Quelle est la fréquence cardiaque normale au repos pour un adulte ?', '["40-50 bpm", "60-100 bpm", "100-120 bpm", "120-150 bpm"]', 1, 'medium'],
  ['Santé', 'Quel organe est principalement affecté par l\'hépatite ?', '["Reins", "Poumons", "Foie", "Cœur"]', 2, 'medium'],
  ['Santé', 'Quelle est la principale cause de décès dans le monde ?', '["Cancer", "Maladies cardiovasculaires", "Accidents de la route", "Maladies infectieuses"]', 1, 'medium'],
  ['Santé', 'Quel est le nom du virus responsable du SIDA ?', '["VHB", "VIH", "VHC", "HPV"]', 1, 'easy'],
  ['Santé', 'Quelle carence provoque le scorbut ?', '["Vitamine A", "Vitamine B", "Vitamine C", "Vitamine D"]', 2, 'hard'],
  ['Santé', 'Quel est le taux normal de glycémie à jeun ?', '["0,4-0,6 g/L", "0,7-1,1 g/L", "1,2-1,5 g/L", "1,6-2,0 g/L"]', 1, 'hard'],
  ['Santé', 'Quelle maladie est caractérisée par une glycémie élevée chronique ?', '["Hypertension", "Diabète", "Anémie", "Asthme"]', 1, 'easy'],
  ['Santé', 'Quel est le nombre de muscles dans le corps humain environ ?', '["200", "400", "600", "800"]', 2, 'hard'],
  ['Santé', 'Quelle est la tension artérielle normale pour un adulte ?', '["100/60 mmHg", "120/80 mmHg", "140/90 mmHg", "160/100 mmHg"]', 1, 'medium'],
  ['Santé', 'Quel est le nutriment principal fourni par les glucides ?', '["Protéines", "Énergie", "Vitamines", "Minéraux"]', 1, 'easy'],
  ['Santé', 'Quelle maladie est causée par une carence en fer ?', '["Ostéoporose", "Anémie", "Rachitisme", "Goitre"]', 1, 'medium'],
  ['Santé', 'Quel est le nom de l\'hormone du stress ?', '["Insuline", "Mélatonine", "Cortisol", "Sérotonine"]', 2, 'hard'],
  ['Santé', 'Quelle est la durée de gestation humaine en semaines ?', '["32 semaines", "36 semaines", "40 semaines", "44 semaines"]', 2, 'easy'],
  ['Santé', 'Quel est le principal agent pathogène de la tuberculose ?', '["Virus", "Bactérie (Mycobacterium)", "Parasite", "Champignon"]', 1, 'hard'],
  ['Santé', 'Quelle est la première cause de mortalité infantile en Afrique ?', '["Paludisme", "Pneumonie", "Diarrhée", "Malnutrition"]', 1, 'hard'],
  ['Santé', 'Quel vaccin protège contre la poliomyélite ?', '["BCG", "VPO/VPI", "ROR", "DTC"]', 1, 'medium'],
  ['Santé', 'Quelle est la fonction principale des globules rouges ?', '["Combattre les infections", "Transporter l\'oxygène", "Coaguler le sang", "Produire des anticorps"]', 1, 'easy'],
  ['Santé', 'Quel est le nom de la maladie osseuse causée par un manque de calcium ?', '["Arthrite", "Ostéoporose", "Scoliose", "Goutte"]', 1, 'medium'],
  ['Santé', 'Quel est le pourcentage d\'eau dans le corps humain adulte environ ?', '["40%", "50%", "60%", "70%"]', 2, 'medium'],
  ['Santé', 'Quelle est la durée de vie moyenne d\'un globule rouge ?', '["30 jours", "60 jours", "120 jours", "365 jours"]', 2, 'hard'],
  ['Santé', 'Quel est le nom de la protéine qui transporte l\'oxygène dans le sang ?', '["Albumine", "Hémoglobine", "Fibrinogène", "Globuline"]', 1, 'medium'],
  ['Santé', 'Quelle maladie est causée par une carence en iode ?', '["Anémie", "Rachitisme", "Goitre", "Scorbut"]', 2, 'hard'],
  ['Santé', 'Combien de dents un adulte possède-t-il normalement ?', '["24", "28", "32", "36"]', 2, 'easy'],
  ['Santé', 'Quel est le rôle principal des fibres alimentaires ?', '["Apporter de l\'énergie", "Faciliter la digestion", "Fournir des protéines", "Renforcer les os"]', 1, 'medium'],
  ['Santé', 'Quelle est la maladie tropicale la plus répandue en RDC ?', '["Choléra", "Paludisme", "Ebola", "Trypanosomiase"]', 1, 'easy'],
  ['Santé', 'Quel est le nom de l\'organisation qui coordonne la lutte contre le VIH/SIDA ?', '["OMS", "ONUSIDA", "UNICEF", "MSF"]', 1, 'medium'],
  ['Santé', 'Quelle est la température corporelle normale ?', '["35,5°C", "36,5°C", "37°C", "38°C"]', 2, 'easy'],
  ['Santé', 'Quel est le type de diabète le plus fréquent ?', '["Type 1", "Type 2", "Gestationnel", "MODY"]', 1, 'medium'],
  ['Santé', 'Quelle est la fonction principale du système lymphatique ?', '["Digestion", "Défense immunitaire", "Respiration", "Circulation sanguine"]', 1, 'hard'],
  ['Santé', 'Quel est le nom de la maladie virale hémorragique apparue en RDC en 1976 ?', '["SIDA", "Choléra", "Ebola", "Marburg"]', 2, 'medium'],
  ['Santé', 'Combien de groupes sanguins principaux existe-t-il ?', '["2", "4", "6", "8"]', 1, 'easy'],
  ['Santé', 'Quel est l\'antibiotique le plus prescrit dans le monde ?', '["Pénicilline", "Amoxicilline", "Ciprofloxacine", "Métronidazole"]', 1, 'hard'],
  ['Santé', 'Quelle est la principale source de vitamine A ?', '["Viande rouge", "Carottes et légumes orange", "Pain complet", "Poisson"]', 1, 'medium'],
  ['Santé', 'Quel est le nom de la couche externe de la peau ?', '["Derme", "Hypoderme", "Épiderme", "Endoderme"]', 2, 'medium'],
  ['Santé', 'Quelle est la maladie causée par le virus SARS-CoV-2 ?', '["SRAS", "MERS", "COVID-19", "Grippe H1N1"]', 2, 'easy'],
  ['Santé', 'Quel est le rôle principal des reins ?', '["Digestion", "Respiration", "Filtration du sang", "Production d\'hormones"]', 2, 'medium'],
  ['Santé', 'Quelle est la durée d\'incubation du paludisme environ ?', '["1-3 jours", "7-14 jours", "30 jours", "60 jours"]', 1, 'hard'],
  ['Santé', 'Quel est le principal mode de transmission du choléra ?', '["Air", "Eau contaminée", "Contact direct", "Moustiques"]', 1, 'medium'],
  ['Santé', 'Quelle est la carence nutritionnelle la plus répandue dans le monde ?', '["Vitamine C", "Fer", "Calcium", "Zinc"]', 1, 'hard'],
  ['Santé', 'Quel est le nom du premier vaccin développé dans l\'histoire ?', '["Vaccin antivariolique", "BCG", "Vaccin antirabique", "Vaccin DTC"]', 0, 'hard'],
  ['Santé', 'Quelle est la partie du cerveau responsable de l\'équilibre ?', '["Cortex cérébral", "Cervelet", "Tronc cérébral", "Hypothalamus"]', 1, 'hard'],
  ['Santé', 'Combien de paires de nerfs crâniens possède le corps humain ?', '["8", "10", "12", "14"]', 2, 'hard'],
  ['Santé', 'Quel minéral est essentiel pour la santé des os et des dents ?', '["Fer", "Zinc", "Calcium", "Potassium"]', 2, 'easy'],
  ['Santé', 'Quelle est la maladie oculaire la plus fréquente liée à l\'âge ?', '["Glaucome", "Cataracte", "Rétinopathie", "Kératite"]', 1, 'medium'],
  ['Santé', 'Quel est le nom de l\'examen qui mesure l\'activité électrique du cœur ?', '["IRM", "Scanner", "ECG/Électrocardiogramme", "Échographie"]', 2, 'medium'],
];

export async function POST(req: Request) {
  try {
    const pool = getPool();
    if (!(await authenticateAdmin(req))) return errorResponse('Admin access required', 403);

    // Create new categories
    const catMap: Record<string, number> = {};
    for (const name of NEW_CATEGORIES) {
      const existing = await pool.query('SELECT id FROM categories WHERE name = $1', [name]);
      if (existing.rows.length > 0) {
        catMap[name] = existing.rows[0].id;
      } else {
        const res = await pool.query('INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id', [name, `Questions de ${name.toLowerCase()}`]);
        catMap[name] = res.rows[0].id;
      }
    }

    // Also load existing categories
    const allCats = await pool.query('SELECT id, name FROM categories');
    for (const c of allCats.rows) {
      catMap[c.name] = c.id;
    }

    let inserted = 0, skipped = 0;
    const errors: string[] = [];

    for (const [cat, question, optionsJson, correctAnswer, difficulty] of QUESTIONS) {
      const categoryId = catMap[cat];
      if (!categoryId) { errors.push(`Category not found: ${cat}`); continue; }

      // Skip if already exists
      const exists = await pool.query('SELECT id FROM questions WHERE question = $1', [question]);
      if (exists.rows.length > 0) { skipped++; continue; }

      try {
        await pool.query(
          'INSERT INTO questions (category_id, question, options, correct_answer, difficulty) VALUES ($1, $2, $3, $4, $5)',
          [categoryId, question, optionsJson, correctAnswer, difficulty]
        );
        inserted++;
      } catch (e: any) {
        errors.push(`${question.slice(0, 50)}: ${e.message}`);
      }
    }

    // Get counts per category
    const counts = await pool.query(
      'SELECT c.name, COUNT(q.id) as total FROM categories c LEFT JOIN questions q ON c.id = q.category_id GROUP BY c.id, c.name ORDER BY c.name'
    );
    const total = await pool.query('SELECT COUNT(*) as c FROM questions');

    return successResponse({
      message: `Added ${inserted} new questions, skipped ${skipped} duplicates`,
      total_questions: Number(total.rows[0].c),
      categories: counts.rows,
      new_categories_created: NEW_CATEGORIES.filter(n => !allCats.rows.find((c: any) => c.name === n)),
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err: any) {
    return errorResponse('Failed to seed questions: ' + err.message, 500);
  }
}
