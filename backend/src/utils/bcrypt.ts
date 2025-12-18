import bcrypt from "bcrypt";

export const hashValue = async (value: string, saltRounds?: number) => {
  return bcrypt.hash(value, saltRounds || 10);
};

export const compareHashedValue = async (
  value: string,
  hashedValue: string
) => {
  return bcrypt.compare(value, hashedValue).catch(() => false);
};
