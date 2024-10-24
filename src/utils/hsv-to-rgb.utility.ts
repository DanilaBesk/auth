export function HSVtoRGB(h: number, s: number, v: number) {
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  const index = i % 6;

  let r: number, g: number, b: number;
  if (index === 0) {
    r = v;
    g = t;
    b = p;
  } else if (index === 1) {
    r = q;
    g = v;
    b = p;
  } else if (index === 2) {
    r = p;
    g = v;
    b = t;
  } else if (index === 3) {
    r = p;
    g = q;
    b = v;
  } else if (index === 4) {
    r = t;
    g = p;
    b = v;
  } else {
    r = v;
    g = p;
    b = q;
  }

  return {
    r: Math.floor(r * 255),
    g: Math.floor(g * 255),
    b: Math.floor(b * 255)
  };
}
