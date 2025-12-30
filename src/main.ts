const atkInput = document.querySelector<HTMLInputElement>("#atk");
const defInput = document.querySelector<HTMLInputElement>("#def");
const hpInput = document.querySelector<HTMLInputElement>("#hp");
const atkSlider = document.querySelector<HTMLInputElement>("#atk-slider");
const defSlider = document.querySelector<HTMLInputElement>("#def-slider");
const hpSlider = document.querySelector<HTMLInputElement>("#hp-slider");
const totalEl = document.querySelector<HTMLSpanElement>("#total");
const percentEl = document.querySelector<HTMLSpanElement>("#percent");
const percentDetailEl = document.querySelector<HTMLSpanElement>("#percent-detail");
const formulaEl = document.querySelector<HTMLDivElement>("#formula");
const statusEl = document.querySelector<HTMLDivElement>("#status");

if (
  !atkInput ||
  !defInput ||
  !hpInput ||
  !atkSlider ||
  !defSlider ||
  !hpSlider ||
  !totalEl ||
  !percentEl ||
  !percentDetailEl ||
  !formulaEl ||
  !statusEl
) {
  throw new Error("Missing required DOM elements.");
}

const inputs = [atkInput, defInput, hpInput];
const sliders = [atkSlider, defSlider, hpSlider];
const maxTotal = 45;

const sanitizeHex = (value: string) => value.replace(/[^0-9A-F]/gi, "").toUpperCase();
const toHex = (value: number) => value.toString(16).toUpperCase();
const setSliderProgress = (slider: HTMLInputElement, value: number) => {
  const clamped = Math.min(15, Math.max(0, value));
  const percent = (clamped / 15) * 100;
  slider.style.setProperty("--slider-progress", `${percent}%`);
};

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
  const rounded = Math.round(value);
  return `${rounded.toFixed(0)}%`;
};

const formatPercentDetail = (value: number) => {
  const rounded = Math.round(value * 10) / 10;
  return `(${rounded.toFixed(1)})`;
};

const updateOutput = () => {
  let hasInvalid = false;
  const parsedValues = inputs.map((input, index) => {
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
    if (result.value !== null) {
      sliders[index].value = `${result.value}`;
      setSliderProgress(sliders[index], result.value);
    }
    return result.value;
  });

  const allValid = parsedValues.every((value) => value !== null);
  const displayParts = parsedValues.map((value) => (value === null ? "--" : value.toString()));

  if (hasInvalid) {
    totalEl.textContent = "--";
    percentEl.textContent = "--";
    percentDetailEl.textContent = "";
    formulaEl.textContent = `${displayParts.join(" + ")} = -- / ${maxTotal}`;
    statusEl.textContent = "不正な入力です。0〜Fを入力してください。";
    statusEl.className = "status warn";
    return;
  }

  if (!allValid) {
    totalEl.textContent = "--";
    percentEl.textContent = "--";
    percentDetailEl.textContent = "";
    formulaEl.textContent = `${displayParts.join(" + ")} = -- / ${maxTotal}`;
    statusEl.textContent = "3つの値を入力してください。";
    statusEl.className = "status";
    return;
  }

  const total = parsedValues.reduce((sum, value) => sum + (value ?? 0), 0);
  const percent = (total / maxTotal) * 100;

  totalEl.textContent = `${total} / ${maxTotal}`;
  percentEl.textContent = formatPercent(percent);
  percentDetailEl.textContent = formatPercentDetail(percent);
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

const sliderToInput = new Map<HTMLInputElement, HTMLInputElement>([
  [atkSlider, atkInput],
  [defSlider, defInput],
  [hpSlider, hpInput],
]);

const handleSlider = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const input = sliderToInput.get(target);
  if (!input) {
    return;
  }
  const value = Number.parseInt(target.value, 10);
  if (!Number.isFinite(value)) {
    return;
  }
  const clamped = Math.min(15, Math.max(0, value));
  input.value = toHex(clamped);
  setSliderProgress(target, clamped);
  updateOutput();
};

inputs.forEach((input) => {
  input.addEventListener("input", handleInput);
});

sliders.forEach((slider) => {
  slider.addEventListener("input", handleSlider);
  const initialValue = Number.parseInt(slider.value, 10);
  setSliderProgress(slider, Number.isFinite(initialValue) ? initialValue : 0);
});

updateOutput();
