export interface Country {
  code: string;
  name: string;
  flag: string;
}

export const countries: Country[] = [
  { code: '+243', name: 'RD Congo', flag: '\u{1F1E8}\u{1F1E9}' },
  { code: '+47', name: 'Norv\u00e8ge', flag: '\u{1F1F3}\u{1F1F4}' },
  { code: '+32', name: 'Belgique', flag: '\u{1F1E7}\u{1F1EA}' },
  { code: '+33', name: 'France', flag: '\u{1F1EB}\u{1F1F7}' },
  { code: '+1', name: 'USA/Canada', flag: '\u{1F1FA}\u{1F1F8}' },
  { code: '+44', name: 'Royaume-Uni', flag: '\u{1F1EC}\u{1F1E7}' },
  { code: '+41', name: 'Suisse', flag: '\u{1F1E8}\u{1F1ED}' },
  { code: '+49', name: 'Allemagne', flag: '\u{1F1E9}\u{1F1EA}' },
  { code: '+27', name: 'Afrique du Sud', flag: '\u{1F1FF}\u{1F1E6}' },
  { code: '+254', name: 'Kenya', flag: '\u{1F1F0}\u{1F1EA}' },
  { code: '+234', name: 'Nigeria', flag: '\u{1F1F3}\u{1F1EC}' },
  { code: '+242', name: 'Congo-Brazzaville', flag: '\u{1F1E8}\u{1F1EC}' },
  { code: '+244', name: 'Angola', flag: '\u{1F1E6}\u{1F1F4}' },
  { code: '+250', name: 'Rwanda', flag: '\u{1F1F7}\u{1F1FC}' },
  { code: '+256', name: 'Ouganda', flag: '\u{1F1FA}\u{1F1EC}' },
  { code: '+255', name: 'Tanzanie', flag: '\u{1F1F9}\u{1F1FF}' },
  { code: '+260', name: 'Zambie', flag: '\u{1F1FF}\u{1F1F2}' },
];
