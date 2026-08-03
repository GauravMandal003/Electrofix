// src/data/indianBanks.js - Comprehensive dataset of major Indian banks for Net Banking
export const INDIAN_BANKS = [
  { id: 'sbi', name: 'State Bank of India (SBI)', shortName: 'SBI', code: 'SBIN', popular: true, logoBg: 'bg-blue-600', logoText: 'SBI' },
  { id: 'hdfc', name: 'HDFC Bank', shortName: 'HDFC Bank', code: 'HDFC', popular: true, logoBg: 'bg-blue-900', logoText: 'HDFC' },
  { id: 'icici', name: 'ICICI Bank', shortName: 'ICICI Bank', code: 'ICIC', popular: true, logoBg: 'bg-orange-600', logoText: 'ICICI' },
  { id: 'axis', name: 'Axis Bank', shortName: 'Axis Bank', code: 'UTIB', popular: true, logoBg: 'bg-rose-700', logoText: 'AXIS' },
  { id: 'pnb', name: 'Punjab National Bank', shortName: 'PNB', code: 'PUNB', popular: false, logoBg: 'bg-amber-600', logoText: 'PNB' },
  { id: 'bob', name: 'Bank of Baroda', shortName: 'Bank of Baroda', code: 'BARB', popular: false, logoBg: 'bg-orange-500', logoText: 'BOB' },
  { id: 'canara', name: 'Canara Bank', shortName: 'Canara Bank', code: 'CNRB', popular: false, logoBg: 'bg-sky-600', logoText: 'CANARA' },
  { id: 'union', name: 'Union Bank of India', shortName: 'Union Bank', code: 'UBIN', popular: false, logoBg: 'bg-red-600', logoText: 'UNION' },
  { id: 'kotak', name: 'Kotak Mahindra Bank', shortName: 'Kotak Bank', code: 'KKBK', popular: true, logoBg: 'bg-red-700', logoText: 'KOTAK' },
  { id: 'indusind', name: 'IndusInd Bank', shortName: 'IndusInd Bank', code: 'INDB', popular: false, logoBg: 'bg-rose-900', logoText: 'INDUS' },
  { id: 'idfc', name: 'IDFC FIRST Bank', shortName: 'IDFC FIRST', code: 'IDFB', popular: false, logoBg: 'bg-purple-800', logoText: 'IDFC' },
  { id: 'yes', name: 'Yes Bank', shortName: 'Yes Bank', code: 'YESB', popular: false, logoBg: 'bg-blue-700', logoText: 'YES' },
  { id: 'federal', name: 'Federal Bank', shortName: 'Federal Bank', code: 'FDRL', popular: false, logoBg: 'bg-amber-700', logoText: 'FED' },
  { id: 'au', name: 'AU Small Finance Bank', shortName: 'AU Small Finance', code: 'AUBL', popular: false, logoBg: 'bg-indigo-700', logoText: 'AU' },
  { id: 'indian', name: 'Indian Bank', shortName: 'Indian Bank', code: 'IDIB', popular: false, logoBg: 'bg-blue-800', logoText: 'INDIAN' }
];

export const POPULAR_INDIAN_BANKS = INDIAN_BANKS.filter(b => b.popular);
