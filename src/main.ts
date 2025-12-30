// 入力・スライダー・出力のDOM参照を取得。
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

// 必要な要素が欠けていたら即座にエラー。
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
const maxStat = 15;
const maxTotal = maxStat * 3;

// 検証用の正規表現。
const hexCharRe = /^[0-9A-F]$/;
const hexTripleRe = /^[0-9A-F]{3}$/;

// 正規化・フォーマット用のヘルパー。
const sanitizeHex = (value: string) => value.replace(/[^0-9A-F]/gi, "").toUpperCase();
const toHex = (value: number) => value.toString(16).toUpperCase();
const setSliderProgress = (slider: HTMLInputElement, value: number) => {
  const clamped = Math.min(maxStat, Math.max(0, value));
  const percent = (clamped / maxStat) * 100;
  slider.style.setProperty("--slider-progress", `${percent}%`);
};

// 3桁の16進数貼り付けで3つの値へ一括反映。
const applyCombined = (value: string) => {
  if (!hexTripleRe.test(value)) {
    return false;
  }

  const [a, d, h] = value.split("");
  atkInput.value = a;
  defInput.value = d;
  hpInput.value = h;
  return true;
};

// 1桁の16進数を数値化し、不正入力も判定。
const parseHex = (value: string) => {
  if (value.length === 0) {
    return { value: null, invalid: false };
  }
  if (!hexCharRe.test(value)) {
    return { value: null, invalid: true };
  }
  const parsed = Number.parseInt(value, 16);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > maxStat) {
    return { value: null, invalid: true };
  }
  return { value: parsed, invalid: false };
};

// 出力用のパーセント表示を整形。
const formatPercent = (value: number) => {
  const rounded = Math.round(value);
  return `${rounded.toFixed(0)}%`;
};

const formatPercentDetail = (value: number) => {
  const rounded = Math.round(value * 10) / 10;
  return `(${rounded.toFixed(1)})`;
};

// 入力値・バリデーション状態・スライダーを同期。
const normalizeInput = (input: HTMLInputElement, slider: HTMLInputElement) => {
  const sanitized = sanitizeHex(input.value);
  const single = sanitized.slice(-1);
  if (input.value !== single) {
    input.value = single;
  }
  const result = parseHex(single);
  input.classList.toggle("invalid", result.invalid);
  input.setAttribute("aria-invalid", result.invalid ? "true" : "false");
  if (result.value !== null) {
    slider.value = `${result.value}`;
    setSliderProgress(slider, result.value);
  }
  return {
    ...result,
    display: result.value === null ? "--" : result.value.toString(),
  };
};

// 未入力/不正入力時の出力表示をリセット。
const resetOutput = (displayParts: string[], message: string, statusClass: string) => {
  totalEl.textContent = "--";
  percentEl.textContent = "--";
  percentDetailEl.textContent = "";
  formulaEl.textContent = `${displayParts.join(" + ")} = -- / ${maxTotal}`;
  statusEl.textContent = message;
  statusEl.className = statusClass;
};

// 合計を再計算してUIを更新。
const updateOutput = () => {
  const parsed = inputs.map((input, index) => normalizeInput(input, sliders[index]));
  const hasInvalid = parsed.some((result) => result.invalid);
  const allValid = parsed.every((result) => result.value !== null);
  const displayParts = parsed.map((result) => result.display);

  if (hasInvalid) {
    resetOutput(displayParts, "不正な入力です。0〜Fを入力してください。", "status warn");
    return;
  }

  if (!allValid) {
    resetOutput(displayParts, "3つの値を入力してください。", "status");
    return;
  }

  const total = parsed.reduce((sum, result) => sum + (result.value ?? 0), 0);
  const percent = (total / maxTotal) * 100;

  totalEl.textContent = `${total} / ${maxTotal}`;
  percentEl.textContent = formatPercent(percent);
  percentDetailEl.textContent = formatPercentDetail(percent);
  formulaEl.textContent = `${displayParts.join(" + ")} = ${total} / ${maxTotal}`;
  statusEl.textContent = "計算完了";
  statusEl.className = "status good";
};

// テキスト入力の変更を処理。
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const sanitized = sanitizeHex(target.value);

  if (applyCombined(sanitized)) {
    updateOutput();
    return;
  }

  if (target.value !== sanitized) {
    target.value = sanitized;
  }

  updateOutput();
};

// スライダーと入力欄の対応を保持。
const sliderToInput = new Map<HTMLInputElement, HTMLInputElement>([
  [atkSlider, atkInput],
  [defSlider, defInput],
  [hpSlider, hpInput],
]);

// スライダー変更を入力欄に反映。
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
  const clamped = Math.min(maxStat, Math.max(0, value));
  input.value = toHex(clamped);
  setSliderProgress(target, clamped);
  updateOutput();
};

// イベント設定と初期表示の更新。
inputs.forEach((input) => {
  input.addEventListener("input", handleInput);
});

sliders.forEach((slider) => {
  slider.addEventListener("input", handleSlider);
  const initialValue = Number.parseInt(slider.value, 10);
  setSliderProgress(slider, Number.isFinite(initialValue) ? initialValue : 0);
});

updateOutput();
