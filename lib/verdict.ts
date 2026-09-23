/** One line the GC says about your run, by wpm. */
const VERDICTS: [minWpm: number, line: string][] = [
  [0, "Bro, you're still finding your building. It's fine, everyone made ligaw once."],
  [20, "You're making effort, we see you. Keep making practice."],
  [35, "Solid. You can make reply to the GC before the chika gets old."],
  [50, "So fast, like you type while crossing High Street with an iced latte."],
  [65, "Your thumbs have their own driver. Legit impressive."],
  [80, "Dude. Pare. Chong. The GC literally cannot keep up with you."],
];

export function verdictFor(wpm: number): string {
  let line = VERDICTS[0][1];
  for (const [min, l] of VERDICTS) if (wpm >= min) line = l;
  return line;
}
