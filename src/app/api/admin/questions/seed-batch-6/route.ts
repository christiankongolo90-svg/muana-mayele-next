import { successResponse, errorResponse, authenticateAdmin } from '../../../_lib/helpers';
import { getPool } from '../../../_lib/db';

type Q = [string, string, string, number, string];

const QUESTIONS: Q[] = [
  // ===================== POLITIQUE MONDIALE (109 questions) =====================

  // --- Révolutions et événements historiques majeurs ---
  ['Politique Mondiale', 'Quel homme d\'État autrichien est considéré comme l\'architecte principal du Congrès de Vienne en 1815 ?', '["Talleyrand", "Klemens von Metternich", "Lord Castlereagh", "Alexandre Ier"]', 1, 'hard'],
  ['Politique Mondiale', 'Quel dirigeant des Khmers rouges a instauré un régime génocidaire au Cambodge de 1975 à 1979 ?', '["Ho Chi Minh", "Pol Pot", "Norodom Sihanouk", "Hun Sen"]', 1, 'hard'],
  ['Politique Mondiale', 'En quelle année la révolution islamique a-t-elle renversé le Shah d\'Iran ?', '["1975", "1979", "1981", "1983"]', 1, 'medium'],
  ['Politique Mondiale', 'Quel leader religieux a pris le pouvoir en Iran après la révolution de 1979 ?', '["Ali Khamenei", "Ayatollah Khomeini", "Mohammad Mossadegh", "Abolhassan Banisadr"]', 1, 'medium'],
  ['Politique Mondiale', 'Quel parti politique a pris le pouvoir lors de la révolution d\'Octobre 1917 en Russie ?', '["Mencheviks", "Bolcheviks", "Socialistes-révolutionnaires", "Cadets"]', 1, 'hard'],
  ['Politique Mondiale', 'Quel dirigeant a fondé l\'Union soviétique en 1922 ?', '["Staline", "Trotski", "Lénine", "Khrouchtchev"]', 2, 'medium'],
  ['Politique Mondiale', 'En quelle année Mao Zedong a-t-il lancé la Révolution culturelle en Chine ?', '["1958", "1962", "1966", "1970"]', 2, 'hard'],
  ['Politique Mondiale', 'En quelle année les manifestations de la place Tiananmen ont-elles été réprimées à Pékin ?', '["1985", "1987", "1989", "1991"]', 2, 'hard'],
  ['Politique Mondiale', 'La « Révolution des Œillets » de 1974 a mis fin à la dictature dans quel pays européen ?', '["Espagne", "Grèce", "Portugal", "Italie"]', 2, 'hard'],
  ['Politique Mondiale', 'Dans quel pays le Printemps arabe a-t-il commencé fin 2010 ?', '["Égypte", "Libye", "Tunisie", "Syrie"]', 2, 'medium'],
  ['Politique Mondiale', 'Quel événement a déclenché le Printemps arabe en Tunisie en décembre 2010 ?', '["Un coup d\'État militaire", "L\'immolation de Mohamed Bouazizi", "Une invasion étrangère", "Des élections truquées"]', 1, 'hard'],
  ['Politique Mondiale', 'Quel ancien esclave est considéré comme le héros principal de la révolution haïtienne ?', '["Jean-Jacques Dessalines", "Toussaint Louverture", "Henri Christophe", "Alexandre Pétion"]', 1, 'hard'],
  ['Politique Mondiale', 'En quelle année Haïti est-elle devenue la première république noire indépendante au monde ?', '["1791", "1798", "1804", "1810"]', 2, 'hard'],
  ['Politique Mondiale', 'Quel leader sud-américain est surnommé le « Libertador » pour son rôle dans l\'indépendance de plusieurs pays ?', '["José de San Martín", "Simón Bolívar", "Bernardo O\'Higgins", "Antonio José de Sucre"]', 1, 'hard'],
  ['Politique Mondiale', 'Le Printemps de Prague de 1968 a été écrasé par l\'intervention militaire de quel pacte ?', '["OTAN", "Pacte de Varsovie", "SEATO", "CENTO"]', 1, 'hard'],

  // --- Coups d'état et changements de régime ---
  ['Politique Mondiale', 'Quel dirigeant chilien a été renversé par un coup d\'État militaire le 11 septembre 1973 ?', '["Eduardo Frei", "Salvador Allende", "Augusto Pinochet", "Ricardo Lagos"]', 1, 'hard'],
  ['Politique Mondiale', 'Quel général a dirigé la dictature militaire au Chili de 1973 à 1990 ?', '["Jorge Videla", "Augusto Pinochet", "Alfredo Stroessner", "Hugo Banzer"]', 1, 'hard'],
  ['Politique Mondiale', 'En quelle année un coup d\'État militaire a-t-il instauré la dictature des colonels en Grèce ?', '["1964", "1967", "1970", "1974"]', 1, 'hard'],
  ['Politique Mondiale', 'Quel pays d\'Asie du Sud-Est a connu un coup d\'État militaire en février 2021, renversant Aung San Suu Kyi ?', '["Thaïlande", "Myanmar", "Cambodge", "Laos"]', 1, 'hard'],
  ['Politique Mondiale', 'Quel dirigeant libyen a été renversé et tué lors de la guerre civile de 2011 ?', '["Zine el-Abidine Ben Ali", "Hosni Moubarak", "Mouammar Kadhafi", "Ali Abdullah Saleh"]', 2, 'medium'],
  ['Politique Mondiale', 'Quel premier ministre du Congo indépendant a été assassiné en janvier 1961 ?', '["Mobutu Sese Seko", "Patrice Lumumba", "Joseph Kasavubu", "Moïse Tshombe"]', 1, 'hard'],

  // --- Guerres et conflits militaires ---
  ['Politique Mondiale', 'Combien de jours a duré la guerre entre Israël et ses voisins arabes en juin 1967 ?', '["Trois jours", "Six jours", "Dix jours", "Quatorze jours"]', 1, 'medium'],
  ['Politique Mondiale', 'En quelle année la guerre du Kippour a-t-elle éclaté entre Israël d\'une part, et l\'Égypte et la Syrie d\'autre part ?', '["1967", "1970", "1973", "1979"]', 2, 'hard'],
  ['Politique Mondiale', 'Quels dirigeants ont signé les accords de Camp David en 1978 ?', '["Arafat et Rabin", "Sadate et Begin", "Nasser et Ben Gourion", "Hussein et Meir"]', 1, 'hard'],
  ['Politique Mondiale', 'La guerre des Malouines en 1982 a opposé l\'Argentine à quel pays ?', '["États-Unis", "Brésil", "Royaume-Uni", "France"]', 2, 'medium'],
  ['Politique Mondiale', 'Quel pays a envahi le Koweït en août 1990, déclenchant la première guerre du Golfe ?', '["Iran", "Irak", "Arabie saoudite", "Syrie"]', 1, 'medium'],
  ['Politique Mondiale', 'Comment s\'appelait l\'opération militaire de la coalition internationale pour libérer le Koweït en 1991 ?', '["Liberté irakienne", "Bouclier du désert", "Tempête du désert", "Renard du désert"]', 2, 'hard'],
  ['Politique Mondiale', 'Quel est le nom de l\'opération militaire américaine lors de l\'invasion de l\'Irak en 2003 ?', '["Tempête du désert", "Liberté irakienne", "Bouclier du désert", "Liberté immuable"]', 1, 'hard'],
  ['Politique Mondiale', 'En quelle année la guerre civile syrienne a-t-elle commencé ?', '["2009", "2011", "2013", "2015"]', 1, 'hard'],
  ['Politique Mondiale', 'En quelle année la chute de Saïgon a-t-elle marqué la fin de la guerre du Vietnam ?', '["1972", "1973", "1975", "1979"]', 2, 'hard'],
  ['Politique Mondiale', 'En quelle année le massacre de Srebrenica a-t-il eu lieu pendant la guerre de Bosnie ?', '["1992", "1993", "1995", "1997"]', 2, 'hard'],
  ['Politique Mondiale', 'La guerre du Biafra (1967-1970) a été une guerre civile dans quel pays africain ?', '["Ghana", "Cameroun", "Nigeria", "Côte d\'Ivoire"]', 2, 'hard'],
  ['Politique Mondiale', 'En quelle année l\'Union soviétique a-t-elle envahi l\'Afghanistan ?', '["1975", "1979", "1982", "1985"]', 1, 'hard'],
  ['Politique Mondiale', 'En quelle année l\'OTAN est-elle intervenue militairement au Kosovo sans mandat du Conseil de sécurité de l\'ONU ?', '["1995", "1997", "1999", "2001"]', 2, 'hard'],
  ['Politique Mondiale', 'La guerre civile espagnole (1936-1939) a opposé les républicains aux forces nationalistes dirigées par quel général ?', '["Juan Carlos", "Francisco Franco", "Emilio Mola", "Miguel Primo de Rivera"]', 1, 'hard'],
  ['Politique Mondiale', 'En quelle année l\'Algérie a-t-elle obtenu son indépendance de la France ?', '["1956", "1958", "1960", "1962"]', 3, 'hard'],
  ['Politique Mondiale', 'Le Bangladesh a obtenu son indépendance en 1971 en se séparant de quel pays ?', '["Inde", "Pakistan", "Myanmar", "Sri Lanka"]', 1, 'hard'],

  // --- Traités, accords et droit international ---
  ['Politique Mondiale', 'Quel accord de 1995 a mis fin à la guerre de Bosnie ?', '["Accords d\'Oslo", "Accords de Dayton", "Accords de Genève", "Accords de Paris"]', 1, 'hard'],
  ['Politique Mondiale', 'Le traité de Rome de 1957 a créé quelle organisation, précurseur de l\'Union européenne ?', '["CECA", "CEE (Communauté économique européenne)", "AELE", "Conseil de l\'Europe"]', 1, 'hard'],
  ['Politique Mondiale', 'Quel traité, entré en vigueur en 2009, a réformé les institutions de l\'Union européenne ?', '["Traité de Nice", "Traité de Lisbonne", "Traité d\'Amsterdam", "Traité de Maastricht"]', 1, 'hard'],
  ['Politique Mondiale', 'Quels accords de 1975, signés à Helsinki, ont marqué un moment de détente entre l\'Est et l\'Ouest pendant la guerre froide ?', '["Accords SALT", "Accords d\'Helsinki", "Accords de Camp David", "Accords de Potsdam"]', 1, 'hard'],
  ['Politique Mondiale', 'Le pacte Molotov-Ribbentrop de 1939 était un accord de non-agression entre quels deux pays ?', '["France et Allemagne", "URSS et Japon", "URSS et Allemagne nazie", "Royaume-Uni et URSS"]', 2, 'hard'],
  ['Politique Mondiale', 'Combien de Conventions de Genève sur le droit humanitaire international ont été adoptées en 1949 ?', '["Deux", "Trois", "Quatre", "Cinq"]', 2, 'hard'],
  ['Politique Mondiale', 'Quels accords de 1993 tentaient de mettre fin au conflit entre le gouvernement rwandais et le FPR avant le génocide ?', '["Accords de Lusaka", "Accords d\'Arusha", "Accords de Pretoria", "Accords de Nairobi"]', 1, 'hard'],
  ['Politique Mondiale', 'Quelle résolution du Conseil de sécurité de l\'ONU a autorisé l\'usage de la force pour libérer le Koweït en 1990 ?', '["Résolution 242", "Résolution 338", "Résolution 678", "Résolution 1441"]', 2, 'hard'],
  ['Politique Mondiale', 'Selon l\'Accord de Paris de 2015, le réchauffement climatique doit être limité bien en dessous de quelle température par rapport aux niveaux préindustriels ?', '["1°C", "1,5°C", "2°C", "3°C"]', 2, 'hard'],
  ['Politique Mondiale', 'Quel concept adopté par l\'ONU en 2005 stipule que la communauté internationale peut intervenir si un État ne protège pas sa population contre les atrocités de masse ?', '["Droit d\'ingérence", "Responsabilité de protéger (R2P)", "Sécurité collective", "Intervention humanitaire"]', 1, 'hard'],

  // --- Politique nucléaire et contrôle des armements ---
  ['Politique Mondiale', 'Comment appelle-t-on en anglais la stratégie nucléaire où chaque camp peut anéantir l\'autre, rendant la guerre impensable ?', '["First Strike", "MAD (Mutual Assured Destruction)", "Détente", "Containment"]', 1, 'hard'],
  ['Politique Mondiale', 'Quel traité de 1987, signé entre les États-Unis et l\'URSS, a éliminé les missiles nucléaires à portée intermédiaire ?', '["SALT I", "START", "Traité INF", "Traité ABM"]', 2, 'hard'],
  ['Politique Mondiale', 'Quel accord de 1972 entre les États-Unis et l\'URSS a limité pour la première fois les arsenaux de missiles balistiques stratégiques ?', '["Traité INF", "SALT I", "START I", "Traité ABM"]', 1, 'hard'],
  ['Politique Mondiale', 'En quelle année l\'accord sur le nucléaire iranien (JCPOA) a-t-il été signé ?', '["2013", "2015", "2017", "2019"]', 1, 'hard'],
  ['Politique Mondiale', 'En quelle année la Corée du Nord a-t-elle effectué son premier essai nucléaire ?', '["2003", "2006", "2009", "2012"]', 1, 'hard'],
  ['Politique Mondiale', 'Quel pays du Moyen-Orient possède l\'arme nucléaire sans avoir signé le Traité sur la non-prolifération (TNP) ?', '["Iran", "Arabie saoudite", "Israël", "Turquie"]', 2, 'hard'],
  ['Politique Mondiale', 'Quel président américain a lancé l\'Initiative de défense stratégique (IDS), surnommée « Guerre des étoiles », en 1983 ?', '["Jimmy Carter", "Ronald Reagan", "George H.W. Bush", "Richard Nixon"]', 1, 'hard'],

  // --- Organisations internationales (approfondissement) ---
  ['Politique Mondiale', 'En quelle année l\'OTAN a-t-elle invoqué pour la première fois l\'article 5 de défense collective ?', '["1991", "1999", "2001", "2003"]', 2, 'hard'],
  ['Politique Mondiale', 'Quel pays a officiellement quitté le Pacte de Varsovie en 1968 ?', '["Roumanie", "Tchécoslovaquie", "Albanie", "Hongrie"]', 2, 'hard'],
  ['Politique Mondiale', 'Comment s\'appelle le tribunal international créé pour juger les crimes commis en ex-Yougoslavie ?', '["CPI", "TPIY", "TPIR", "CIJ"]', 1, 'hard'],
  ['Politique Mondiale', 'Quel chef de milice congolais a été la première personne condamnée par la Cour pénale internationale (CPI) en 2012 ?', '["Jean-Pierre Bemba", "Thomas Lubanga", "Bosco Ntaganda", "Germain Katanga"]', 1, 'hard'],
  ['Politique Mondiale', 'Combien de juges siègent à la Cour internationale de Justice (CIJ) ?', '["9", "12", "15", "21"]', 2, 'hard'],
  ['Politique Mondiale', 'Quelle agence de l\'ONU est spécifiquement chargée des réfugiés palestiniens ?', '["HCR", "UNRWA", "UNICEF", "PNUD"]', 1, 'hard'],
  ['Politique Mondiale', 'Combien d\'États souverains sont issus de l\'éclatement de l\'ex-Yougoslavie (jusqu\'en 2008) ?', '["Cinq", "Six", "Sept", "Huit"]', 2, 'hard'],
  ['Politique Mondiale', 'L\'espace Schengen, qui permet la libre circulation sans contrôle aux frontières, tire son nom d\'une ville de quel pays ?', '["Belgique", "France", "Luxembourg", "Pays-Bas"]', 2, 'hard'],
  ['Politique Mondiale', 'Dans quelle ville américaine la Charte des Nations unies a-t-elle été signée en juin 1945 ?', '["New York", "Washington", "San Francisco", "Genève"]', 2, 'hard'],

  // --- Disputes territoriales ---
  ['Politique Mondiale', 'La région du Cachemire est un territoire disputé principalement entre quels deux pays ?', '["Chine et Japon", "Inde et Pakistan", "Iran et Afghanistan", "Inde et Chine"]', 1, 'hard'],
  ['Politique Mondiale', 'Quel pays revendique la quasi-totalité de la mer de Chine méridionale en traçant la « ligne en neuf traits » ?', '["Japon", "Vietnam", "Chine", "Philippines"]', 2, 'hard'],
  ['Politique Mondiale', 'Le plateau du Golan, occupé par Israël depuis 1967, appartenait auparavant à quel pays ?', '["Liban", "Jordanie", "Syrie", "Égypte"]', 2, 'hard'],
  ['Politique Mondiale', 'Quel pays a envahi le nord de Chypre en 1974, entraînant la division de l\'île ?', '["Grèce", "Turquie", "Royaume-Uni", "Égypte"]', 1, 'hard'],
  ['Politique Mondiale', 'Le conflit du Haut-Karabakh oppose principalement quels deux pays ?', '["Géorgie et Russie", "Arménie et Azerbaïdjan", "Turquie et Irak", "Iran et Azerbaïdjan"]', 1, 'hard'],

  // --- Idéologies politiques et mouvements ---
  ['Politique Mondiale', 'Quel penseur allemand est considéré comme le père du communisme moderne avec la publication du « Manifeste du Parti communiste » en 1848 ?', '["Friedrich Engels", "Karl Marx", "Lénine", "Rosa Luxemburg"]', 1, 'medium'],
  ['Politique Mondiale', 'Dans quel pays le fascisme est-il né comme mouvement politique au début du XXe siècle ?', '["Allemagne", "Espagne", "Italie", "Portugal"]', 2, 'medium'],
  ['Politique Mondiale', 'Quel dirigeant yougoslave a cofondé le Mouvement des non-alignés avec Nehru et Nasser ?', '["Enver Hoxha", "Josip Broz Tito", "Nicolae Ceaușescu", "Todor Jivkov"]', 1, 'hard'],
  ['Politique Mondiale', 'Quel syndicat polonais, fondé en 1980, a joué un rôle clé dans la chute du communisme en Europe de l\'Est ?', '["Parti ouvrier", "Solidarność", "Charte 77", "Forum civique"]', 1, 'hard'],
  ['Politique Mondiale', 'Quel dirigeant du syndicat Solidarność est devenu président de la Pologne en 1990 ?', '["Wojciech Jaruzelski", "Lech Wałęsa", "Aleksander Kwaśniewski", "Tadeusz Mazowiecki"]', 1, 'hard'],
  ['Politique Mondiale', 'La « Doctrine Brejnev » justifiait principalement quel type d\'action ?', '["L\'expansion nucléaire soviétique", "L\'intervention militaire dans les pays socialistes", "La coexistence pacifique avec l\'Occident", "Le désarmement unilatéral"]', 1, 'hard'],
  ['Politique Mondiale', 'Comment appelle-t-on la période de persécution anticommuniste aux États-Unis dans les années 1950, menée par le sénateur Joseph McCarthy ?', '["New Deal", "Maccarthysme", "Doctrine Truman", "Programme de loyauté"]', 1, 'hard'],
  ['Politique Mondiale', 'La doctrine Monroe de 1823 s\'opposait principalement à l\'intervention de quelles puissances sur le continent américain ?', '["Asiatiques", "Africaines", "Européennes", "Océaniennes"]', 2, 'hard'],

  // --- Dirigeants mondiaux et élections ---
  ['Politique Mondiale', 'En quelle année Aung San Suu Kyi a-t-elle reçu le prix Nobel de la paix ?', '["1988", "1991", "1995", "2000"]', 1, 'hard'],
  ['Politique Mondiale', 'Combien d\'années Nelson Mandela a-t-il passé en prison avant sa libération en 1990 ?', '["18 ans", "23 ans", "27 ans", "31 ans"]', 2, 'medium'],
  ['Politique Mondiale', 'Sur quelle île Nelson Mandela a-t-il été emprisonné pendant la majeure partie de sa détention ?', '["Île de Gorée", "Robben Island", "Île de la Réunion", "Île Maurice"]', 1, 'hard'],
  ['Politique Mondiale', 'En quelle année le Mahatma Gandhi a-t-il été assassiné ?', '["1945", "1947", "1948", "1950"]', 2, 'hard'],
  ['Politique Mondiale', 'Quel dirigeant a fondé la République de Turquie et lancé un programme de modernisation laïque ?', '["Sultan Mehmed VI", "Mustafa Kemal Atatürk", "İsmet İnönü", "Enver Pacha"]', 1, 'hard'],
  ['Politique Mondiale', 'En quelle année l\'Empire ottoman a-t-il officiellement cessé d\'exister avec la proclamation de la République de Turquie ?', '["1918", "1920", "1923", "1926"]', 2, 'hard'],
  ['Politique Mondiale', 'En quelle année le président Richard Nixon a-t-il effectué sa visite historique en Chine communiste ?', '["1969", "1971", "1972", "1974"]', 2, 'hard'],
  ['Politique Mondiale', 'Quel président serbe a été le premier chef d\'État en exercice inculpé par un tribunal pénal international ?', '["Radovan Karadžić", "Slobodan Milošević", "Ratko Mladić", "Franjo Tuđman"]', 1, 'hard'],

  // --- Sanctions, embargos, droits de l'homme et réfugiés ---
  ['Politique Mondiale', 'Quel type de sanctions internationales a été massivement appliqué contre l\'Afrique du Sud pendant l\'apartheid ?', '["Sanctions alimentaires", "Embargo sur les armes et sanctions économiques", "Blocus naval", "Intervention militaire"]', 1, 'hard'],
  ['Politique Mondiale', 'Depuis quelle décennie les États-Unis maintiennent-ils un embargo commercial contre Cuba ?', '["Années 1950", "Années 1960", "Années 1970", "Années 1980"]', 1, 'hard'],
  ['Politique Mondiale', 'À la suite de quel événement de 2014 l\'Union européenne a-t-elle imposé ses premières sanctions économiques contre la Russie ?', '["La guerre en Syrie", "L\'annexion de la Crimée", "Le conflit en Géorgie", "L\'empoisonnement de Skripal"]', 1, 'hard'],
  ['Politique Mondiale', 'En quelle année le génocide arménien a-t-il commencé dans l\'Empire ottoman ?', '["1905", "1910", "1915", "1920"]', 2, 'hard'],
  ['Politique Mondiale', 'Le conflit au Darfour, qualifié de génocide par les États-Unis, se déroule dans quel pays ?', '["Tchad", "Soudan", "Éthiopie", "Somalie"]', 1, 'hard'],
  ['Politique Mondiale', 'Quel pays voisin de la Syrie accueille le plus grand nombre de réfugiés syriens ?', '["Jordanie", "Liban", "Turquie", "Irak"]', 2, 'hard'],
  ['Politique Mondiale', 'Le journaliste Jamal Khashoggi a été assassiné en 2018 dans le consulat d\'Arabie saoudite de quelle ville ?', '["Ankara", "Istanbul", "Le Caire", "Beyrouth"]', 1, 'hard'],

  // --- Guerre froide et géopolitique ---
  ['Politique Mondiale', 'Quel homme politique a utilisé l\'expression « rideau de fer » dans un célèbre discours en 1946 ?', '["Harry Truman", "Winston Churchill", "Charles de Gaulle", "Dwight Eisenhower"]', 1, 'hard'],
  ['Politique Mondiale', 'En 1948-1949, le pont aérien de Berlin a été organisé pour contourner quel blocus ?', '["Le blocus américain de Cuba", "Le blocus soviétique de Berlin-Ouest", "Le blocus britannique de l\'Égypte", "Le blocus français de l\'Allemagne"]', 1, 'hard'],
  ['Politique Mondiale', 'En quelle année le mur de Berlin a-t-il été construit ?', '["1955", "1958", "1961", "1963"]', 2, 'hard'],
  ['Politique Mondiale', 'Comment s\'appelait le service de renseignement soviétique pendant la guerre froide ?', '["CIA", "MI6", "KGB", "Mossad"]', 2, 'medium'],
  ['Politique Mondiale', 'Le Mossad est le service de renseignement extérieur de quel pays ?', '["Turquie", "Arabie saoudite", "Israël", "Égypte"]', 2, 'medium'],
  ['Politique Mondiale', 'Quel terme désigne l\'accumulation compétitive d\'armes nucléaires entre les États-Unis et l\'URSS pendant la guerre froide ?', '["Guerre des étoiles", "Course aux armements", "Équilibre de la terreur", "Détente nucléaire"]', 1, 'hard'],
  ['Politique Mondiale', 'Quel programme secret de la CIA a fourni des armes aux moudjahidines afghans contre l\'URSS dans les années 1980 ?', '["Opération Condor", "Opération Cyclone", "Opération Gladio", "Opération Ajax"]', 1, 'hard'],
  ['Politique Mondiale', 'Quel programme secret de la CIA a organisé le renversement du Premier ministre iranien Mohammad Mossadegh en 1953 ?', '["Opération Condor", "Opération Ajax", "Opération Cyclone", "Opération Gladio"]', 1, 'hard'],

  // --- Conférences et justice internationale ---
  ['Politique Mondiale', 'Dans quelle ville allemande les principaux criminels de guerre nazis ont-ils été jugés en 1945-1946 ?', '["Berlin", "Munich", "Nuremberg", "Hambourg"]', 2, 'medium'],
  ['Politique Mondiale', 'Quel concept juridique a été formellement défini pour la première fois lors du procès de Nuremberg en 1945 ?', '["Droit de veto", "Crimes contre l\'humanité", "Droit d\'ingérence", "Responsabilité de protéger"]', 1, 'hard'],
  ['Politique Mondiale', 'En quelle année la conférence de Yalta a-t-elle réuni Roosevelt, Churchill et Staline pour discuter de l\'après-guerre ?', '["1943", "1944", "1945", "1946"]', 2, 'hard'],
  ['Politique Mondiale', 'Quelle conférence de 1945, tenue après la capitulation de l\'Allemagne, a défini les conditions de l\'occupation du pays ?', '["Conférence de Yalta", "Conférence de Potsdam", "Conférence de Téhéran", "Conférence de Casablanca"]', 1, 'hard'],
  ['Politique Mondiale', 'La crise du canal de Suez en 1956 a été provoquée par la nationalisation du canal par quel dirigeant ?', '["Anouar el-Sadate", "Gamal Abdel Nasser", "Hosni Moubarak", "Roi Farouk"]', 1, 'hard'],

  // --- Décolonisation et Afrique ---
  ['Politique Mondiale', 'Quelle année est connue comme « l\'année de l\'Afrique » en raison de l\'indépendance de 17 pays africains ?', '["1957", "1958", "1960", "1963"]', 2, 'hard'],
  ['Politique Mondiale', 'La conférence de Berlin de 1884-1885 a organisé le partage de quel continent entre les puissances européennes ?', '["Asie", "Amérique du Sud", "Afrique", "Océanie"]', 2, 'medium'],
  ['Politique Mondiale', 'En quelle année l\'Inde a-t-elle obtenu son indépendance du Royaume-Uni ?', '["1945", "1947", "1949", "1950"]', 1, 'medium'],
  ['Politique Mondiale', 'La partition de l\'Inde en 1947 a créé quel nouvel État à majorité musulmane ?', '["Bangladesh", "Pakistan", "Afghanistan", "Sri Lanka"]', 1, 'medium'],
  ['Politique Mondiale', 'Quel événement de 1934-1935, mené par Mao Zedong, est connu sous le nom de « Longue Marche » ?', '["Une campagne militaire au Japon", "Une retraite stratégique de l\'armée rouge chinoise", "Une révolution culturelle", "Une réforme agraire"]', 1, 'hard'],

  // ===================== SANTÉ (81 questions) =====================

  // --- Histoire de la médecine et découvertes ---
  ['Santé', 'Quel médecin hongrois du XIXe siècle a découvert l\'importance du lavage des mains pour prévenir la fièvre puerpérale ?', '["Joseph Lister", "Ignace Semmelweis", "Louis Pasteur", "Robert Koch"]', 1, 'hard'],
  ['Santé', 'Quel scientifique français a développé la théorie des germes et le procédé de pasteurisation ?', '["Robert Koch", "Louis Pasteur", "Claude Bernard", "Alexandre Yersin"]', 1, 'hard'],
  ['Santé', 'Quel médecin allemand a identifié le bacille de la tuberculose en 1882 ?', '["Louis Pasteur", "Rudolf Virchow", "Robert Koch", "Paul Ehrlich"]', 2, 'hard'],
  ['Santé', 'Quel scientifique a découvert la pénicilline en 1928 ?', '["Alexander Fleming", "Howard Florey", "Ernst Boris Chain", "Joseph Lister"]', 0, 'hard'],
  ['Santé', 'Quel chirurgien sud-africain a réalisé la première transplantation cardiaque au monde en 1967 ?', '["Michael DeBakey", "Christiaan Barnard", "Denton Cooley", "Norman Shumway"]', 1, 'hard'],
  ['Santé', 'Quel médecin britannique a introduit l\'antisepsie chirurgicale au XIXe siècle en utilisant l\'acide phénique ?', '["Ignace Semmelweis", "Joseph Lister", "Robert Koch", "Florence Nightingale"]', 1, 'hard'],
  ['Santé', 'Florence Nightingale est considérée comme la fondatrice de quelle profession médicale moderne ?', '["Chirurgie", "Soins infirmiers", "Pharmacie", "Épidémiologie"]', 1, 'hard'],
  ['Santé', 'En quelle année l\'anesthésie générale a-t-elle été utilisée pour la première fois en chirurgie ?', '["1820", "1846", "1867", "1885"]', 1, 'hard'],
  ['Santé', 'Quel médecin anglais a établi le lien entre le choléra et l\'eau contaminée à Londres en 1854 ?', '["Edward Jenner", "John Snow", "Joseph Lister", "Robert Koch"]', 1, 'hard'],
  ['Santé', 'Quelle chercheuse chinoise a reçu le prix Nobel de médecine en 2015 pour sa découverte de l\'artémisinine ?', '["Tu Youyou", "Shi Zhengli", "Chen Wei", "Li Lanjuan"]', 0, 'hard'],

  // --- Maladies tropicales et infectieuses (avancé) ---
  ['Santé', 'La maladie de Chagas est causée par quel parasite ?', '["Trypanosoma cruzi", "Trypanosoma brucei", "Leishmania donovani", "Plasmodium vivax"]', 0, 'hard'],
  ['Santé', 'Comment s\'appelle l\'insecte vecteur de la maladie de Chagas ?', '["Moustique Aedes", "Mouche tsé-tsé", "Triatome (punaise)", "Puce"]', 2, 'hard'],
  ['Santé', 'La dengue est transmise principalement par quel type de moustique ?', '["Anopheles gambiae", "Aedes aegypti", "Culex pipiens", "Aedes albopictus"]', 1, 'hard'],
  ['Santé', 'Combien de sérotypes du virus de la dengue existe-t-il ?', '["2", "3", "4", "5"]', 2, 'hard'],
  ['Santé', 'La leishmaniose viscérale, aussi appelée kala-azar, est transmise par quel insecte ?', '["Moustique", "Phlébotome", "Mouche tsé-tsé", "Puce"]', 1, 'hard'],
  ['Santé', 'Quelle maladie tropicale négligée, causée par le ver Dracunculus medinensis, est proche de l\'éradication mondiale ?', '["Filariose lymphatique", "Dracunculose (ver de Guinée)", "Onchocercose", "Schistosomiase"]', 1, 'hard'],
  ['Santé', 'L\'onchocercose, aussi appelée « cécité des rivières », est causée par quel parasite ?', '["Wuchereria bancrofti", "Onchocerca volvulus", "Schistosoma mansoni", "Loa loa"]', 1, 'hard'],
  ['Santé', 'La bilharziose (schistosomiase) se transmet par contact avec de l\'eau contenant quel organisme ?', '["Des moustiques infectés", "Des cercaires libérées par des escargots d\'eau douce", "Des bactéries fécales", "Des amibes parasitaires"]', 1, 'hard'],
  ['Santé', 'Le virus Ebola tire son nom d\'une rivière située dans quel pays ?', '["Ouganda", "Soudan", "République démocratique du Congo", "Gabon"]', 2, 'hard'],
  ['Santé', 'Quel est le principal mode de transmission du virus Ebola ?', '["Par voie aérienne", "Par contact direct avec les fluides corporels", "Par l\'eau contaminée", "Par les piqûres de moustiques"]', 1, 'hard'],
  ['Santé', 'La fièvre de Lassa est une fièvre hémorragique virale endémique principalement dans quelle région ?', '["Afrique de l\'Est", "Afrique de l\'Ouest", "Asie du Sud-Est", "Amérique du Sud"]', 1, 'hard'],
  ['Santé', 'Quel rongeur est le principal réservoir du virus de Lassa ?', '["Rat noir (Rattus rattus)", "Rat de Mastomys (Mastomys natalensis)", "Souris domestique", "Écureuil terrestre"]', 1, 'hard'],
  ['Santé', 'La méningite à méningocoques est particulièrement fréquente dans quelle zone géographique africaine ?', '["Afrique australe", "Ceinture de la méningite (Sahel)", "Afrique centrale forestière", "Afrique du Nord"]', 1, 'hard'],
  ['Santé', 'Quel virus est responsable de la mononucléose infectieuse, aussi appelée « maladie du baiser » ?', '["Cytomégalovirus", "Virus d\'Epstein-Barr (EBV)", "Virus herpès simplex", "Adénovirus"]', 1, 'hard'],

  // --- Pandémies et épidémies historiques ---
  ['Santé', 'Quelle est la pandémie de grippe la plus meurtrière du XXe siècle, survenue en 1918-1919 ?', '["Grippe asiatique", "Grippe de Hong Kong", "Grippe espagnole", "Grippe russe"]', 2, 'hard'],
  ['Santé', 'Combien de personnes la grippe espagnole a-t-elle tuées selon les estimations ?', '["5 à 10 millions", "20 à 30 millions", "50 à 100 millions", "150 à 200 millions"]', 2, 'hard'],
  ['Santé', 'La peste noire du XIVe siècle était causée par quelle bactérie ?', '["Vibrio cholerae", "Yersinia pestis", "Bacillus anthracis", "Clostridium botulinum"]', 1, 'hard'],
  ['Santé', 'Le SIDA a été identifié pour la première fois comme syndrome clinique en quelle année ?', '["1978", "1981", "1983", "1985"]', 1, 'hard'],
  ['Santé', 'Quel organisme international a déclaré la COVID-19 comme pandémie en mars 2020 ?', '["ONU", "OMS", "CDC", "UNICEF"]', 1, 'medium'],

  // --- Épidémiologie et santé publique ---
  ['Santé', 'En quelle année l\'Organisation mondiale de la Santé (OMS) a-t-elle été fondée ?', '["1945", "1946", "1948", "1950"]', 2, 'hard'],
  ['Santé', 'Quel est le siège de l\'Organisation mondiale de la Santé (OMS) ?', '["New York", "Genève", "Bruxelles", "Vienne"]', 1, 'medium'],
  ['Santé', 'Le terme « R0 » (R zéro) en épidémiologie désigne quoi ?', '["Le taux de mortalité d\'une maladie", "Le nombre de reproduction de base d\'un agent infectieux", "Le pourcentage de la population vaccinée", "La durée d\'incubation d\'un virus"]', 1, 'hard'],
  ['Santé', 'En épidémiologie, que mesure la « prévalence » d\'une maladie ?', '["Le nombre de nouveaux cas sur une période donnée", "Le nombre total de cas existants à un moment donné", "Le taux de mortalité de la maladie", "La vitesse de propagation du pathogène"]', 1, 'hard'],
  ['Santé', 'Quel pourcentage de la population doit être immunisé pour atteindre l\'immunité collective contre la rougeole ?', '["60-70 %", "75-80 %", "85-90 %", "93-95 %"]', 3, 'hard'],
  ['Santé', 'Comment qualifie-t-on une maladie infectieuse qui se propage sur plusieurs continents à l\'échelle mondiale ?', '["Épidémie", "Endémie", "Pandémie", "Épizootie"]', 2, 'medium'],

  // --- Santé mentale ---
  ['Santé', 'La schizophrénie est associée à un excès de quel neurotransmetteur selon l\'hypothèse dopaminergique ?', '["Sérotonine", "Dopamine", "GABA", "Glutamate"]', 1, 'hard'],
  ['Santé', 'Quel trouble mental se caractérise par des alternances entre des épisodes maniaques et des épisodes dépressifs ?', '["Schizophrénie", "Trouble bipolaire", "Trouble obsessionnel-compulsif", "Trouble de la personnalité borderline"]', 1, 'hard'],
  ['Santé', 'Quel est le nom du trouble de stress qui peut apparaître après un événement traumatisant ?', '["Trouble bipolaire", "Trouble obsessionnel-compulsif", "Trouble de stress post-traumatique (TSPT)", "Trouble d\'anxiété généralisée"]', 2, 'medium'],
  ['Santé', 'Quel neurotransmetteur est principalement ciblé par les antidépresseurs de type ISRS ?', '["Dopamine", "Noradrénaline", "Sérotonine", "GABA"]', 2, 'hard'],
  ['Santé', 'La maladie d\'Alzheimer est caractérisée par l\'accumulation de quelles protéines anormales dans le cerveau ?', '["Prions", "Plaques amyloïdes et protéines tau", "Alpha-synucléine", "Corps de Lewy"]', 1, 'hard'],

  // --- Pharmacologie et traitements ---
  ['Santé', 'De quelle plante la quinine, utilisée contre le paludisme, est-elle extraite ?', '["Armoise", "Quinquina", "Eucalyptus", "Saule"]', 1, 'hard'],
  ['Santé', 'L\'artémisinine, antipaludéen puissant, est extraite de quelle plante utilisée en médecine traditionnelle chinoise ?', '["Quinquina", "Armoise annuelle (Artemisia annua)", "Ginseng", "Aloe vera"]', 1, 'hard'],
  ['Santé', 'Quel antipaludéen, largement utilisé pendant la Seconde Guerre mondiale, est dérivé de la quinine ?', '["Chloroquine", "Méfloquine", "Doxycycline", "Primaquine"]', 0, 'hard'],
  ['Santé', 'Comment appelle-t-on une bactérie résistante à la méthicilline, posant un problème majeur dans les hôpitaux ?', '["E. coli BLSE", "SARM (Staphylococcus aureus résistant à la méthicilline)", "Clostridium difficile", "Pseudomonas aeruginosa"]', 1, 'hard'],
  ['Santé', 'Quel terme désigne la capacité des bactéries à survivre et se multiplier en présence d\'antibiotiques ?', '["Virulence", "Antibiorésistance", "Pathogénicité", "Mutation génétique"]', 1, 'hard'],
  ['Santé', 'Le vaccin BCG protège contre quelle maladie ?', '["Poliomyélite", "Tuberculose", "Fièvre jaune", "Diphtérie"]', 1, 'hard'],

  // --- Anatomie et physiologie (avancé) ---
  ['Santé', 'Quelles cellules du pancréas produisent l\'insuline ?', '["Cellules alpha", "Cellules bêta", "Cellules delta", "Cellules acineuses"]', 1, 'hard'],
  ['Santé', 'Le glucagon, hormone qui augmente la glycémie, est produit par quelles cellules du pancréas ?', '["Cellules alpha", "Cellules bêta", "Cellules delta", "Cellules PP"]', 0, 'hard'],
  ['Santé', 'Quelle glande, située à la base du cerveau, est appelée « glande maîtresse » car elle régule de nombreuses autres glandes endocrines ?', '["Thyroïde", "Hypophyse", "Hypothalamus", "Surrénale"]', 1, 'hard'],
  ['Santé', 'Les glandes surrénales produisent quelle hormone en réponse au stress aigu ?', '["Cortisol", "Adrénaline (épinéphrine)", "Mélatonine", "Ocytocine"]', 1, 'hard'],
  ['Santé', 'Quel organe du système immunitaire est responsable de la maturation des lymphocytes T ?', '["Rate", "Thymus", "Moelle osseuse", "Ganglions lymphatiques"]', 1, 'hard'],
  ['Santé', 'La rate a pour fonction principale de filtrer quoi ?', '["La lymphe", "Le sang", "L\'urine", "Le liquide cérébrospinal"]', 1, 'hard'],
  ['Santé', 'Quel type de globule blanc est le plus abondant dans le sang humain ?', '["Lymphocytes", "Neutrophiles", "Monocytes", "Éosinophiles"]', 1, 'hard'],
  ['Santé', 'Quel est le rôle principal des lymphocytes B dans le système immunitaire ?', '["Détruire les cellules infectées", "Produire des anticorps", "Phagocyter les bactéries", "Réguler l\'inflammation"]', 1, 'hard'],
  ['Santé', 'Comment s\'appelle la protéine produite par les lymphocytes B pour neutraliser les agents pathogènes ?', '["Antigène", "Anticorps (immunoglobuline)", "Interféron", "Cytokine"]', 1, 'hard'],
  ['Santé', 'Quel est le plus grand organe du corps humain ?', '["Le foie", "La peau", "Les poumons", "L\'intestin grêle"]', 1, 'medium'],
  ['Santé', 'Combien de litres d\'air les poumons d\'un adulte peuvent-ils contenir en moyenne à leur capacité maximale ?', '["3 litres", "4 litres", "6 litres", "8 litres"]', 2, 'hard'],
  ['Santé', 'Quel est le nom de la protéine présente dans les poumons qui réduit la tension superficielle des alvéoles ?', '["Kératine", "Surfactant pulmonaire", "Élastine", "Mucine"]', 1, 'hard'],
  ['Santé', 'Dans quel organe la bile est-elle stockée avant d\'être libérée dans l\'intestin ?', '["Foie", "Vésicule biliaire", "Pancréas", "Rate"]', 1, 'hard'],
  ['Santé', 'Quel est le principal neurotransmetteur inhibiteur du système nerveux central ?', '["Glutamate", "Acétylcholine", "GABA", "Dopamine"]', 2, 'hard'],
  ['Santé', 'Quel est le principal neurotransmetteur excitateur du système nerveux central ?', '["GABA", "Glutamate", "Sérotonine", "Glycine"]', 1, 'hard'],
  ['Santé', 'Quel acide aminé est le précurseur de la dopamine ?', '["Tryptophane", "Tyrosine", "Glutamine", "Histidine"]', 1, 'hard'],
  ['Santé', 'Combien de paires de chromosomes possède une cellule humaine normale ?', '["21 paires", "22 paires", "23 paires", "24 paires"]', 2, 'medium'],
  ['Santé', 'La trisomie 21 (syndrome de Down) est causée par la présence d\'un chromosome supplémentaire sur quelle paire ?', '["Paire 13", "Paire 18", "Paire 21", "Paire 23"]', 2, 'hard'],

  // --- Santé maternelle et infantile ---
  ['Santé', 'La pré-éclampsie est une complication grave de la grossesse caractérisée principalement par quoi ?', '["Diabète gestationnel", "Hypertension et protéinurie", "Anémie sévère", "Infection urinaire"]', 1, 'hard'],
  ['Santé', 'Quelle est la première cause de mortalité maternelle dans les pays en développement ?', '["Hémorragie post-partum", "Pré-éclampsie", "Infection puerpérale", "Embolie pulmonaire"]', 0, 'hard'],
  ['Santé', 'À partir de combien de semaines de grossesse un bébé est-il considéré comme prématuré ?', '["Avant 34 semaines", "Avant 37 semaines", "Avant 38 semaines", "Avant 40 semaines"]', 1, 'hard'],
  ['Santé', 'Quelle carence nutritionnelle chez la femme enceinte peut provoquer des malformations du tube neural chez le fœtus ?', '["Vitamine C", "Fer", "Acide folique (vitamine B9)", "Vitamine D"]', 2, 'hard'],

  // --- Diagnostic médical ---
  ['Santé', 'Quelle technique d\'imagerie médicale utilise des ondes sonores à haute fréquence pour visualiser les organes ?', '["Scanner (tomodensitométrie)", "Échographie", "Radiographie", "Scintigraphie"]', 1, 'hard'],
  ['Santé', 'Quel examen médical permet de détecter des anomalies chromosomiques du fœtus en prélevant du liquide amniotique ?', '["Échographie", "Amniocentèse", "Biopsie de trophoblaste", "Test de Coombs"]', 1, 'hard'],

  // --- Cancérologie ---
  ['Santé', 'Quel virus cause le cancer du col de l\'utérus ?', '["VIH", "HPV (papillomavirus humain)", "Virus d\'Epstein-Barr", "Herpès simplex"]', 1, 'hard'],
  ['Santé', 'Quel type de cancer est le plus fréquent chez les femmes dans le monde ?', '["Cancer du col de l\'utérus", "Cancer du sein", "Cancer du poumon", "Cancer colorectal"]', 1, 'hard'],
  ['Santé', 'Quel type de cancer est le plus meurtrier au monde, tous sexes confondus ?', '["Cancer du sein", "Cancer colorectal", "Cancer du poumon", "Cancer de l\'estomac"]', 2, 'hard'],

  // --- Nutrition et carences ---
  ['Santé', 'Le kwashiorkor est une forme grave de malnutrition causée par une carence en quoi ?', '["Calories totales", "Protéines", "Vitamines", "Minéraux"]', 1, 'hard'],
  ['Santé', 'Le marasme est une forme de malnutrition sévère caractérisée par une carence en quoi ?', '["Protéines uniquement", "Vitamines uniquement", "Énergie (calories) totale", "Fer uniquement"]', 2, 'hard'],
  ['Santé', 'Quelle maladie, causée par une carence en niacine (vitamine B3), provoque les « 3 D » : dermatite, diarrhée et démence ?', '["Béribéri", "Pellagre", "Scorbut", "Rachitisme"]', 1, 'hard'],
  ['Santé', 'Le béribéri est causé par une carence en quelle vitamine ?', '["Vitamine B1 (thiamine)", "Vitamine B6 (pyridoxine)", "Vitamine B9 (acide folique)", "Vitamine B12 (cobalamine)"]', 0, 'hard'],
  ['Santé', 'Quelle vitamine est essentielle à la coagulation du sang ?', '["Vitamine A", "Vitamine E", "Vitamine K", "Vitamine B12"]', 2, 'hard'],

  // --- Hématologie et sang ---
  ['Santé', 'La drépanocytose (anémie falciforme) est causée par une anomalie de quelle protéine ?', '["Albumine", "Hémoglobine", "Fibrinogène", "Myoglobine"]', 1, 'hard'],
  ['Santé', 'Quel est le groupe sanguin considéré comme « receveur universel » ?', '["O+", "A+", "B+", "AB+"]', 3, 'hard'],
  ['Santé', 'La maladie de Crohn affecte principalement quel système du corps ?', '["Système respiratoire", "Système digestif", "Système nerveux", "Système urinaire"]', 1, 'medium'],
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
      message: `Batch 6: Added ${added} new questions, skipped ${skipped} duplicates`,
      total_questions: Number(totalRes.rows[0].c),
      categories: catCounts.rows,
    });
  } catch (err: any) {
    return errorResponse('Seed failed: ' + err.message, 500);
  }
}
