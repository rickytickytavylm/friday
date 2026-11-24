/* Конфиг лендинга Чёрной пятницы — всё, что нужно заполнить перед запуском. */
window.BF_CONFIG = {
  // Конец акции (МСК). Таймер и текст «осталось …» считаются отсюда.
  BF_END: "2026-12-01T23:59:59+03:00",

  // Ссылки оплаты. Если пусто — открывается форма GetCourse из WIDGETS.
  PAY: {
    anxiety: "",
    start: "",
    close: "",
    adhd: "",
  },

  // Формы оплаты GetCourse. Ключ = data-pay на кнопке курса.
  WIDGETS: {
    start: {
      title: "Видеокурс зависимых",
      hash: "be24f20f5f6dfaaf23f79e113292f1020af6f613",
      src: "https://tvoi-shag.online/pl/lite/widget/script?id=1687125",
    },
    close: {
      title: "Видеокурс созависимых",
      hash: "d283ce6310fb30b1e3f2e203e9549130cb429732",
      src: "https://tvoi-shag.online/pl/lite/widget/script?id=1687128",
    },
    anxiety: {
      title: "Видеокурс по тревоге",
      hash: "3eddd111b1f429aacce262b0d880f6a83d53976f",
      src: "https://tvoi-shag.online/pl/lite/widget/script?id=1687132",
    },
    adhd: {
      title: "Видеокурс по СДВГ",
      hash: "3e09b1c7be4d50318be580d1c5f7918a273f4091",
      src: "https://tvoi-shag.online/pl/lite/widget/script?id=1687134",
    },
  },

  // Старые цены (перечёркнутые). Пустая строка — не показывать.
  OLD_PRICE: {
    anxiety: "",
    start: "",
    close: "",
    adhd: "9 900 ₽",
  },

  // Трекинг просмотров/кликов на оплату (тот же контур, что у landing_coda).
  // Пустая строка — выключить.
  TRACK_URL: "https://api.kira-ai.online/api/coda/hit",
};
