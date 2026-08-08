const toTitleCase = (str) => {
  if (!str) return str;
  const smallWords = new Set([
    'a',
    'an',
    'and',
    'as',
    'at',
    'but',
    'by',
    'for',
    'in',
    'of',
    'on',
    'or',
    'the',
    'to',
    'with',
  ]);

  return str
    .toLowerCase()
    .split(' ')
    .map((word, i) => {
      if (i !== 0 && smallWords.has(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

const cleanFoodDescription = (description) => {
  if (!description) return description;
  const isShouting = description === description.toUpperCase();
  return isShouting ? toTitleCase(description) : description;
};

module.exports = { toTitleCase, cleanFoodDescription };
