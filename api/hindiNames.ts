// Adds a Hindi-script name in brackets next to a newly added produce item,
// e.g. "Cucumber" -> "Cucumber (खीरा)". Looks up common produce in a small
// dictionary first, and falls back to spelling the word out phonetically in
// Devanagari when it isn't a recognized item.

const PRODUCE_DICTIONARY: Record<string, string> = {
  'avocado': 'एवोकाडो',
  'tomato': 'टमाटर',
  'potato': 'आलू',
  'onion': 'प्याज़',
  'garlic': 'लहसुन',
  'ginger': 'अदरक',
  'spinach': 'पालक',
  'kale': 'पालक',
  'cabbage': 'पत्ता गोभी',
  'cauliflower': 'फूल गोभी',
  'carrot': 'गाजर',
  'radish': 'मूली',
  'beetroot': 'चुकंदर',
  'beet': 'चुकंदर',
  'cucumber': 'खीरा',
  'brinjal': 'बैंगन',
  'eggplant': 'बैंगन',
  'okra': 'भिंडी',
  'lady finger': 'भिंडी',
  'bitter gourd': 'करेला',
  'bittergourd': 'करेला',
  'bottle gourd': 'लौकी',
  'pumpkin': 'कद्दू',
  'green beans': 'सेम',
  'beans': 'सेम',
  'sweet corn': 'भुट्टा',
  'corn': 'भुट्टा',
  'capsicum': 'शिमला मिर्च',
  'bell pepper': 'शिमला मिर्च',
  'chili': 'मिर्च',
  'chilli': 'मिर्च',
  'mushroom': 'मशरूम',
  'lemon': 'नींबू',
  'lime': 'नींबू',
  'apple': 'सेब',
  'banana': 'केला',
  'mango': 'आम',
  'grape': 'अंगूर',
  'orange': 'संतरा',
  'papaya': 'पपीता',
  'guava': 'अमरूद',
  'pomegranate': 'अनार',
  'watermelon': 'तरबूज़',
  'muskmelon': 'खरबूज़ा',
  'strawberry': 'स्ट्रॉबेरी',
  'pineapple': 'अनानास',
  'coconut': 'नारियल',
  'basil': 'तुलसी',
  'mint': 'पुदीना',
  'coriander': 'धनिया',
  'cilantro': 'धनिया',
  'curry leaves': 'करी पत्ता',
  'fenugreek': 'मेथी',
  'methi': 'मेथी',
  'dill': 'सोआ',
  'peas': 'मटर',
  'pea': 'मटर',
  'egg': 'अंडे',
  'honey': 'शहद',
  'milk': 'दूध',
  'paneer': 'पनीर',
  'rice': 'चावल',
  'wheat': 'गेहूं',
  'turmeric': 'हल्दी',
  'jaggery': 'गुड़'
};

// Sort keys longest-first so multi-word entries (e.g. "bell pepper") are
// checked before shorter ones that might also match a substring.
const DICTIONARY_KEYS = Object.keys(PRODUCE_DICTIONARY).sort((a, b) => b.length - a.length);

function lookupHindiWord(name: string): string | null {
  const lower = name.toLowerCase();
  for (const key of DICTIONARY_KEYS) {
    if (lower.includes(key)) {
      return PRODUCE_DICTIONARY[key];
    }
  }
  return null;
}

const VOWEL_MATRAS: Record<string, string> = {
  aa: 'ा', ii: 'ी', ee: 'ी', uu: 'ू', oo: 'ू',
  ai: 'ै', au: 'ौ',
  a: '', i: 'ि', u: 'ु', e: 'े', o: 'ो'
};

const INITIAL_VOWELS: Record<string, string> = {
  aa: 'आ', ii: 'ई', ee: 'ई', uu: 'ऊ', oo: 'ऊ',
  ai: 'ऐ', au: 'औ',
  a: 'अ', i: 'इ', u: 'उ', e: 'ए', o: 'ओ'
};

const CONSONANTS: Record<string, string> = {
  kh: 'ख', gh: 'घ', chh: 'छ', ch: 'च', jh: 'झ', th: 'थ', dh: 'ध', ph: 'फ', bh: 'भ', sh: 'श',
  k: 'क', g: 'ग', j: 'ज', t: 'त', d: 'द', n: 'न', p: 'प', b: 'ब', m: 'म', y: 'य', r: 'र',
  l: 'ल', v: 'व', w: 'व', s: 'स', h: 'ह', f: 'फ़', z: 'ज़', x: 'क्स', q: 'क', c: 'क'
};

const VOWEL_KEYS = Object.keys(INITIAL_VOWELS).sort((a, b) => b.length - a.length);
const CONSONANT_KEYS = Object.keys(CONSONANTS).sort((a, b) => b.length - a.length);

// Best-effort phonetic spelling in Devanagari for words not in the dictionary.
function transliterateWord(word: string): string {
  const lower = word.toLowerCase();
  let result = '';
  let i = 0;

  while (i < lower.length) {
    const consKey = CONSONANT_KEYS.find(c => lower.startsWith(c, i));
    if (consKey) {
      i += consKey.length;
      const vowelKey = VOWEL_KEYS.find(v => lower.startsWith(v, i));
      if (vowelKey) {
        result += CONSONANTS[consKey] + VOWEL_MATRAS[vowelKey];
        i += vowelKey.length;
      } else {
        result += CONSONANTS[consKey];
      }
      continue;
    }

    const vowelKey = VOWEL_KEYS.find(v => lower.startsWith(v, i));
    if (vowelKey) {
      result += INITIAL_VOWELS[vowelKey];
      i += vowelKey.length;
      continue;
    }

    // Unrecognized character (digit, punctuation, etc.) - skip it.
    i++;
  }

  return result;
}

function transliterate(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map(transliterateWord)
    .join(' ');
}

const DEVANAGARI_PATTERN = /[ऀ-ॿ]/;

// Appends "(हिंदी)" to a produce name unless it already has Devanagari text
// in it (e.g. the farmer already typed one in themselves).
export function withHindiName(rawName: string): string {
  const name = rawName.trim();
  if (!name || DEVANAGARI_PATTERN.test(name)) {
    return name;
  }

  const hindiWord = lookupHindiWord(name) || transliterate(name);
  if (!hindiWord) {
    return name;
  }

  return `${name} (${hindiWord})`;
}
