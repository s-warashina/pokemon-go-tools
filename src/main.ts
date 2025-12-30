const atkInput = document.querySelector<HTMLInputElement>("#atk");
const defInput = document.querySelector<HTMLInputElement>("#def");
const hpInput = document.querySelector<HTMLInputElement>("#hp");
const totalEl = document.querySelector<HTMLSpanElement>("#total");
const percentEl = document.querySelector<HTMLSpanElement>("#percent");
const formulaEl = document.querySelector<HTMLDivElement>("#formula");
const statusEl = document.querySelector<HTMLDivElement>("#status");

if (!atkInput || !defInput || !hpInput || !totalEl || !percentEl || !formulaEl || !statusEl) {
  throw new Error("Missing required DOM elements.");
}

const inputs = [atkInput, defInput, hpInput];
const maxTotal = 45;

const sanitizeHex = (value: string) => value.replace(/[^0-9A-F]/gi, "").toUpperCase();

const applyCombined = (value: string) => {
  if (!/^[0-9A-F]{3}$/.test(value)) {
    return false;
  }

  const [a, d, h] = value.split("");
  atkInput.value = a;
  defInput.value = d;
  hpInput.value = h;
  return true;
};

const parseHex = (value: string) => {
  if (value.length === 0) {
    return { value: null, invalid: false };
  }
  if (value.length !== 1) {
    return { value: null, invalid: true };
  }
  if (!/^[0-9A-F]+$/.test(value)) {
    return { value: null, invalid: true };
  }
  const parsed = Number.parseInt(value, 16);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 15) {
    return { value: null, invalid: true };
  }
  return { value: parsed, invalid: false };
};

const formatPercent = (value: number) => {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded.toFixed(0)}%` : `${rounded.toFixed(1)}%`;
};

const updateOutput = () => {
  let hasInvalid = false;
  const parsedValues = inputs.map((input) => {
    const sanitized = sanitizeHex(input.value).slice(-1);
    if (input.value !== sanitized) {
      input.value = sanitized;
    }
    const result = parseHex(sanitized);
    input.classList.toggle("invalid", result.invalid);
    input.setAttribute("aria-invalid", result.invalid ? "true" : "false");
    if (result.invalid) {
      hasInvalid = true;
    }
    return result.value;
  });

  const allValid = parsedValues.every((value) => value !== null);
  const displayParts = parsedValues.map((value) => (value === null ? "--" : value.toString()));

  if (hasInvalid) {
    totalEl.textContent = "--";
    percentEl.textContent = "--";
    formulaEl.textContent = `${displayParts.join(" + ")} = -- / ${maxTotal}`;
    statusEl.textContent = "不正な入力です。0〜Fを入力してください。";
    statusEl.className = "status warn";
    return;
  }

  if (!allValid) {
    totalEl.textContent = "--";
    percentEl.textContent = "--";
    formulaEl.textContent = `${displayParts.join(" + ")} = -- / ${maxTotal}`;
    statusEl.textContent = "3つの値を入力してください。";
    statusEl.className = "status";
    return;
  }

  const total = parsedValues.reduce((sum, value) => sum + (value ?? 0), 0);
  const percent = (total / maxTotal) * 100;

  totalEl.textContent = `${total} / ${maxTotal}`;
  percentEl.textContent = formatPercent(percent);
  formulaEl.textContent = `${displayParts.join(" + ")} = ${total} / ${maxTotal}`;
  statusEl.textContent = "計算完了";
  statusEl.className = "status good";
};

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const sanitized = sanitizeHex(target.value);

  if (applyCombined(sanitized)) {
    updateOutput();
    return;
  }

  const singleHex = sanitized.slice(-1);
  if (target.value !== singleHex) {
    target.value = singleHex;
  }

  updateOutput();
};

inputs.forEach((input) => {
  input.addEventListener("input", handleInput);
});

updateOutput();
