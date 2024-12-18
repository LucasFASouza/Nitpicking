export const validateInput = (input: {
  author: string;
  title: string;
  category: string;
  phrase_text: string;
  error: string;
  correction: string;
  notes: string;
}) => {
  const maxLength = {
    author: 120,
    title: 120,
    category: 120,
    phrase_text: 960,
    error: 240,
    correction: 480,
    notes: 960,
  };

  if (input.author?.length > maxLength.author) return false;
  if (input.title.length > maxLength.title) return false;
  if (input.phrase_text.length > maxLength.phrase_text) return false;
  if (input.error.length > maxLength.error) return false;
  if (input.correction.length > maxLength.correction) return false;
  if (input.notes?.length > maxLength.notes) return false;

  const containsScript = /<script|javascript:|data:/i;
  if (containsScript.test(JSON.stringify(input))) return false;

  return true;
};
