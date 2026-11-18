
const KEY = "grouphub_submissions";

export const getCodes = () => {
  try {
    const data = localStorage.getItem(KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading submission codes:", error);
    return [];
  }
};

export const addCode = (code) => {
  if (!code) return;

  try {
    const codes = getCodes();

    const updatedCodes = [
      ...new Set([...codes, String(code).trim()])
    ];

    localStorage.setItem(KEY, JSON.stringify(updatedCodes));

    return updatedCodes;
  } catch (error) {
    console.error("Error saving submission code:", error);
    return [];
  }
};

export const removecode = (code) => {
  try {
    const updatedCodes = getCodes().filter(
      item => item !== String(code)
    );

    localStorage.setItem(KEY, JSON.stringify(updatedCodes));

    return updatedCodes;
  } catch (error) {
    console.error("Error removing submission code:", error);
    return [];
  }
};

export const clearCodes = () => {
  localStorage.removeItem(KEY);
};
