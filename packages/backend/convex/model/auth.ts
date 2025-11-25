const SECRET = process.env.SECRET as string;
console.log("Validating secret:", SECRET);

export const validateSecret = (secret: string) => {
  // console.log("Validating secret:", secret, SECRET);

  return secret === SECRET;
};
