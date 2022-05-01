/* eslint-disable no-undef */
export const referenceError = () => {
  try {
    a = 1;
    return a;
  } catch (error) {
    return error;
  }
};
export default { referenceError };
