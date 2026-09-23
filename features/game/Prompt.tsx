/** The target line, one span per character, words kept whole so a line never breaks mid-word. */
export function Prompt({ target, value }: { target: string; value: string }) {
  const words: { start: number; text: string }[] = [];
  let start = 0;
  for (const text of target.split(" ")) {
    words.push({ start, text });
    start += text.length + 1;
  }
  const cls = (i: number) => {
    const c = target[i];
    if (i === value.length) return "ch cur";
    if (i > value.length) return "ch";
    return value[i] === c ? "ch ok" : c === " " ? "ch bad sp" : "ch bad";
  };
  return (
    <span aria-hidden="true">
      {words.map((w, wi) => (
        // the trailing space lives inside the word's inline-block so a wrapped line never starts with a space
        <span key={w.start} className="w">
          {[...w.text].map((c, i) => (
            <span key={i} className={cls(w.start + i)}>
              {c}
            </span>
          ))}
          {wi < words.length - 1 && <span className={cls(w.start + w.text.length)}> </span>}
        </span>
      ))}
    </span>
  );
}
