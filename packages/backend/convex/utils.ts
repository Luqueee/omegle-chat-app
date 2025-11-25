export function generateUuidWithCrypto(): string {
  return (([1e7] as any) + -1e3 + -4e3 + -8e3 + -1e11).replace(
    /[018]/g,
    (c: string) =>
      (
        parseInt(c, 10) ^ // Ensure 'c' is parsed as a number
        (crypto.getRandomValues(new Uint8Array(1))[0] &
          (15 >> (parseInt(c, 10) / 4)))
      ).toString(16)
  );
}
