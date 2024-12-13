export const validateInput = (input: {
  author: string;
  category: string;
  phrase_text: string;
  error: string;
  correction: string;
  notes: string;
}) => {
  const maxLength = {
    author: 50,
    category: 30,
    phrase_text: 500,
    error: 100,
    correction: 200,
    notes: 1000,
  };

  if (input.author?.length > maxLength.author) return false;
  if (input.phrase_text.length > maxLength.phrase_text) return false;
  if (input.error.length > maxLength.error) return false;
  if (input.correction.length > maxLength.correction) return false;
  if (input.notes?.length > maxLength.notes) return false;

  const containsScript = /<script|javascript:|data:/i;
  if (containsScript.test(JSON.stringify(input))) return false;

  return true;
};
