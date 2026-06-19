export function randomNumber(
  min: number,
  max: number
) {
  return Math.floor(
    Math.random() * (max - min + 1)
  ) + min;
}

export function varySalary(
  amount: number,
  variancePercent = 10
) {
  const variance = Math.floor(
    amount * (variancePercent / 100)
  );

  return randomNumber(
    amount - variance,
    amount + variance
  );
}

export function calculateTotalCompensation(
  base: number,
  bonus: number,
  stock: number
) {
  return base + bonus + stock;
}