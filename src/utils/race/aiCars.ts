import { CAR_COLORS } from '../../constants/race';

export function generateAICars(
  count: number,
  usedColors: string[],
  usedNumbers: number[]
): { color: string; number: number }[] {
  const availableColors = CAR_COLORS.filter(c => !usedColors.includes(c.value));
  const cars: { color: string; number: number }[] = [];
  const allUsedNumbers = [...usedNumbers];

  for (let i = 0; i < count; i++) {
    const color = availableColors[i % availableColors.length]?.value || CAR_COLORS[i % CAR_COLORS.length].value;
    let number = Math.floor(Math.random() * 99) + 1;
    while (allUsedNumbers.includes(number)) {
      number = Math.floor(Math.random() * 99) + 1;
    }
    allUsedNumbers.push(number);
    cars.push({ color, number });
  }

  return cars;
}
