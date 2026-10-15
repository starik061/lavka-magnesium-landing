const offers = {
  60: { size: 60, title: "Почати", price: 399, oldPrice: 665, discount: "−40%", gifts: 0, guides: 0, telegramPrice: 379 },
  120: { size: 120, title: "Вибудувати рутину", price: 798, oldPrice: 1330, discount: "−40%", gifts: 1, guides: 5, telegramPrice: 758 },
  180: { size: 180, title: "Максимум вигоди", price: 1197, oldPrice: 1995, discount: "−40%", gifts: 2, guides: 10, telegramPrice: 1137 },
};

const gifts = {
  spirulina: "Спіруліна",
  pollen: "Пилок",
  activator: "Активатор",
  booster: "Підсилювач",
};

const quizQuestions = [
  {
    title: "Що хочете підтримати в першу чергу?",
    hint: "Оберіть один варіант",
    options: [
      ["calm", "Спокій протягом дня"],
      ["evening", "Легше розслаблятися ввечері"],
      ["muscles", "Комфорт у м’язах"],
      ["energy", "Рівний ресурс при навантаженні"],
    ],
  },
  {
    title: "Як часто ви відчуваєте напругу або втому?",
    hint: "Це не діагностика — лише орієнтир для персоналізації",
    options: [
      ["sometimes", "Час від часу"],
      ["often", "Кілька разів на тиждень"],
      ["daily", "Майже щодня"],
    ],
  },
  {
    title: "Коли це відчувається найсильніше?",
    hint: "Оберіть найближчий сценарій",
    options: [
      ["day", "Протягом робочого дня"],
      ["night", "Увечері"],
      ["load", "Після фізичного навантаження"],
      ["unclear", "Складно визначити"],
    ],
  },
  {
    title: "На який період хочете вибудувати рутину?",
    hint: "Це допоможе підібрати формат баночки",
    options: [
      ["try", "Хочу спробувати базовий формат"],
      ["course", "Хочу пройти повноцінний курс"],
      ["stock", "Хочу взяти запас і максимальну вигоду"],
    ],
  },
  {
    title: "Що для вас важливіше при виборі?",
    hint: "Останній крок — і покажемо результат",
    options: [
      ["price", "Мінімальна сума покупки"],
      ["balance", "Баланс ціни й тривалості"],
      ["bonus", "Подарунки та максимальна економія"],
    ],
  },
];

const profiles = {
  calm: {
    title: "Ваш фокус — денний спокій",
    copy: "Вам важливо м’якше проходити насичений день і залишати місце для внутрішньої рівноваги. Магній гліцинат можна додати до щоденної рутини як підтримку нервової системи та енергетичного обміну.",
  },
  evening: {
    title: "Ваш фокус — вечірнє відновлення",
    copy: "Вам важливо легше перемикатися з активного дня на відпочинок. Магній гліцинат доречно вписується у вечірню рутину як підтримка нервової системи, м’язів і якісного відновлення.",
  },
  muscles: {
    title: "Ваш фокус — вільні м’язи",
    copy: "У вашому сценарії важливе комфортне відновлення після навантажень і менше відчуття внутрішнього затиску. Магній бере участь у нормальній роботі м’язів і легко стає частиною щоденного графіка.",
  },
  energy: {
    title: "Ваш фокус — рівний ресурс",
    copy: "Ви шукаєте підтримку для насиченого розумового або фізичного дня. Магній бере участь в енергетичному обміні, а регулярна рутина допомагає не забувати про власне відновлення.",
  },
};

const state = {
  quizIndex: 0,
  answers: [],
  selectedOffer: 120,
  selectedGifts: [],
  resultShown: false,
};

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

function track(event, payload = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...payload });
}

function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 3400);
}

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function getProfileKey() {
  const first = state.answers[0] || "evening";
  if (profiles[first]) return first;
  if (state.answers[2] === "load") return "muscles";
  if (state.answers[2] === "day") return "calm";
  return "evening";
}

function getOfferFromQuiz() {
  const duration = state.answers[3];
  const priority = state.answers[4];
  if (duration === "stock" || priority === "bonus") return 180;
  if (duration === "try" || priority === "price") return 60;
  return 120;
}

function renderQuiz() {
  const content = $("#quiz-content");
  const question = quizQuestions[state.quizIndex];
  if (!content || !question) return;

  const currentAnswer = state.answers[state.quizIndex];
  content.innerHTML = `
    <div class="quiz-question">
      <p class="quiz-hint">${question.hint}</p>
      <h3>${question.title}</h3>
      <div class="quiz-options" role="group" aria-label="Варіанти відповіді">
        ${question.options.map(([value, label]) => `<button class="quiz-option${currentAnswer === value ? " is-selected" : ""}" type="button" data-answer="${value}">${label}</button>`).join("")}
      </div>
    </div>
  `;

  $$(".quiz-option", content).forEach((button) => {
    button.addEventListener("click", () => {
      state.answers[state.quizIndex] = button.dataset.answer;
      $$(".quiz-option", content).forEach((item) => item.classList.toggle("is-selected", item === button));
      $("#quiz-next").disabled = false;
      track("quiz_answer", { question: state.quizIndex + 1, answer: button.dataset.answer });
      if (state.quizIndex === quizQuestions.length - 1) {
        window.setTimeout(() => {
          if (!state.resultShown) renderQuizResult();
        }, 220);
      }
    });
  });

  const percent = Math.round(((state.quizIndex + 1) / quizQuestions.length) * 100);
  $("#quiz-step-label").textContent = `Питання ${state.quizIndex + 1} з ${quizQuestions.length}`;
  $("#quiz-progress-value").textContent = `${percent}%`;
  $("#quiz-progress-bar").style.width = `${percent}%`;
  $("#quiz-back").disabled = state.quizIndex === 0;
  $("#quiz-next").disabled = !currentAnswer;
  $("#quiz-next").innerHTML = state.quizIndex === quizQuestions.length - 1 ? "Показати результат <span aria-hidden=\"true\">↗</span>" : "Далі <span aria-hidden=\"true\">→</span>";
  const result = $("#quiz-result");
  result.hidden = true;
  result.classList.remove("is-visible");
  result.style.display = "";
  result.innerHTML = "";
}

function renderQuizResult() {
  if (state.resultShown) return;
  const result = $("#quiz-result");
  const profile = profiles[getProfileKey()];
  const offerId = getOfferFromQuiz();
  const offer = offers[offerId];
  state.selectedOffer = offerId;
  syncOfferUI();
  state.resultShown = true;
  result.hidden = false;
  result.removeAttribute("hidden");
  result.classList.add("is-visible");
  result.style.display = "block";
  result.innerHTML = `
    <p class="result-label">Ваш результат</p>
    <h3>${profile.title}</h3>
    <p>${profile.copy}</p>
    <div class="result-offer"><div><small>Рекомендуємо</small><strong>${offer.size} капсул · ${offer.price} грн</strong></div><span>${offer.gifts ? `+ ${offer.gifts} подарунок${offer.gifts > 1 ? "и" : ""}` : "базовий формат"}</span></div>
    <div class="result-actions"><button class="button button-dark" type="button" id="result-offer-button">Обрати цей формат ↗</button><button class="button button-outline" type="button" id="quiz-restart">Пройти ще раз</button></div>
  `;
  $("#quiz-content").style.display = "none";
  $(".quiz-navigation").style.display = "none";
  $("#quiz-progress-value").textContent = "Готово";
  $("#quiz-progress-bar").style.width = "100%";
  $("#quiz-step-label").textContent = "Ваш результат";
  $("#result-offer-button").addEventListener("click", () => { scrollToId("offers"); track("quiz_result_cta", { offer: offerId, profile: getProfileKey() }); });
  $("#quiz-restart").addEventListener("click", restartQuiz);
  track("quiz_complete", { offer: offerId, profile: getProfileKey() });
  window.setTimeout(() => result.scrollIntoView({ behavior: "smooth", block: "nearest" }), 60);
}

function restartQuiz() {
  state.quizIndex = 0;
  state.answers = [];
  state.resultShown = false;
  $("#quiz-content").style.display = "block";
  $(".quiz-navigation").style.display = "flex";
  renderQuiz();
}

function syncOfferUI() {
  const offer = offers[state.selectedOffer];
  $$("[data-offer-card]").forEach((card) => card.classList.toggle("is-selected", Number(card.dataset.offerCard) === state.selectedOffer));
  $("#summary-offer").textContent = `${offer.size} капсул`;
  $("#summary-old-price").textContent = `${offer.oldPrice.toLocaleString("uk-UA")} грн`;
  $("#summary-price").textContent = `${offer.price.toLocaleString("uk-UA")} грн`;
  updateGiftLimit();
  track("offer_select", { offer: state.selectedOffer });
}

function updateGiftLimit() {
  const offer = offers[state.selectedOffer];
  const limit = offer.gifts;
  const copy = $("#gift-limit-copy");
  const note = $("#gift-selection-note");
  const continueButton = $("#gift-continue");
  if (limit === 0) copy.textContent = "Оберіть 120 або 180 капсул, щоб відкрити подарунки.";
  if (limit === 1) copy.textContent = "Формат 120 капсул: оберіть 1 подарунок із 4.";
  if (limit === 2) copy.textContent = "Формат 180 капсул: оберіть 2 подарунки із 4.";
  if (state.selectedGifts.length > limit) state.selectedGifts = state.selectedGifts.slice(0, limit);
  $$(".gift-card").forEach((card) => {
    const selected = state.selectedGifts.includes(card.dataset.gift);
    card.classList.toggle("is-selected", selected);
    card.setAttribute("aria-pressed", String(selected));
    card.querySelector(".gift-check").textContent = selected ? "✓" : "+";
  });
  const names = state.selectedGifts.map((gift) => gifts[gift]);
  $("#summary-gift").textContent = offer.gifts === 0 ? "Подарунки доступні від 120 капсул" : `Подарунок: ${names.length ? names.join(", ") : "оберіть у блоці вище"}`;
  if (note) {
    if (!limit) note.textContent = "Для цього формату подарунки не передбачені — можна одразу перейти до заявки.";
    else if (state.selectedGifts.length === limit) note.textContent = "Подарунок обрано. Перевірте підсумок і залиште заявку.";
    else note.textContent = `Оберіть ${limit === 1 ? "1 подарунок" : `${limit} подарунки`} — і перейдіть до оформлення заявки.`;
  }
  if (continueButton) continueButton.textContent = "Перейти до оформлення ↗";
}

function selectOffer(offerId, shouldScroll = false) {
  state.selectedOffer = Number(offerId);
  state.selectedGifts = [];
  syncOfferUI();
  if (shouldScroll) scrollToId(offers[state.selectedOffer].gifts ? "gifts" : "order");
  showToast(`Обрано формат ${state.selectedOffer} капсул`);
}

function initGifts() {
  $$(".gift-card").forEach((card) => {
    card.addEventListener("click", () => {
      const offer = offers[state.selectedOffer];
      if (!offer.gifts) {
        showToast("Подарунки відкриваються для формату від 120 капсул");
        scrollToId("offers");
        return;
      }
      const gift = card.dataset.gift;
      const index = state.selectedGifts.indexOf(gift);
      if (index >= 0) state.selectedGifts.splice(index, 1);
      else if (state.selectedGifts.length < offer.gifts) state.selectedGifts.push(gift);
      else { showToast(`Для цього формату можна обрати ${offer.gifts} подарунок${offer.gifts > 1 ? "и" : ""}`); return; }
      updateGiftLimit();
      track("gift_select", { offer: state.selectedOffer, gift });
    });
  });
  $("#gift-continue").addEventListener("click", () => {
    const offer = offers[state.selectedOffer];
    if (offer.gifts && state.selectedGifts.length < offer.gifts) {
      showToast(`Оберіть ${offer.gifts === 1 ? "подарунок" : `${offer.gifts} подарунки`} перед оформленням`);
      return;
    }
    scrollToId("order");
    track("gift_continue", { offer: state.selectedOffer, gifts: state.selectedGifts });
  });
}

function initHabitTracker() {
  const key = "molfar-magnesium-habit";
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(key) || "{}"); } catch { saved = {}; }
  const boxes = $$('[data-habit]');
  boxes.forEach((box) => { box.checked = Boolean(saved[box.dataset.habit]); });
  const update = () => {
    const done = boxes.filter((box) => box.checked).length;
    $("#habit-progress-text").textContent = `${done} з ${boxes.length} кроків`;
    $("#habit-progress-bar").style.width = `${(done / boxes.length) * 100}%`;
    const values = Object.fromEntries(boxes.map((box) => [box.dataset.habit, box.checked]));
    try { localStorage.setItem(key, JSON.stringify(values)); } catch { /* приватний режим браузера */ }
  };
  boxes.forEach((box) => box.addEventListener("change", update));
  update();
}

function initOrderForm() {
  $("#order-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const name = form.elements.name.value.trim();
    const phone = form.elements.phone.value.trim();
    if (!name || phone.length < 7 || !form.elements.consent.checked) return;
    const offer = offers[state.selectedOffer];
    $("#form-status").textContent = `Дякуємо, ${name}! Заявку на ${offer.size} капсул підготовлено — менеджер зв’яжеться з вами.`;
    form.reset();
    track("lead_submit", { offer: state.selectedOffer, gifts: state.selectedGifts });
  });
}

function initNavigation() {
  const toggle = $(".nav-toggle");
  const nav = $("#site-nav");
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("menu-open", open);
  });
  $$(".site-nav a").forEach((link) => link.addEventListener("click", () => {
    nav.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); document.body.classList.remove("menu-open");
  }));
  $$('[data-track]').forEach((element) => element.addEventListener("click", () => track(element.dataset.track)));
}

function init() {
  $("#current-year").textContent = new Date().getFullYear();
  renderQuiz();
  initGifts();
  initHabitTracker();
  initOrderForm();
  initNavigation();
  syncOfferUI();
  $$(".offer-select").forEach((button) => button.addEventListener("click", () => selectOffer(button.dataset.offer, true)));
  $("#quiz-next").addEventListener("click", () => {
    if (!state.answers[state.quizIndex]) return;
    if (state.quizIndex === quizQuestions.length - 1) renderQuizResult();
    else { state.quizIndex += 1; renderQuiz(); }
  });
  $("#quiz-back").addEventListener("click", () => { if (state.quizIndex > 0) { state.quizIndex -= 1; renderQuiz(); } });
}

document.addEventListener("DOMContentLoaded", init);
