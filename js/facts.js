const form = document.querySelector("#contact-form");
const status = document.querySelector("#form-status");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = form.elements.name.value.trim();
  const phone = form.elements.phone.value.trim();

  if (!name || !phone) {
    status.textContent = "Заполните оба поля.";
    return;
  }

  status.textContent = "Форма заполнена. Для отправки нужен сервер.";
});