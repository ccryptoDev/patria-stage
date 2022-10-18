import { closeModal, openModal } from "./modal";
import { printPage } from "./modal";

document.addEventListener("click", function(e) {
  const elem = e.target;

  // close modal on ouside click
  if (elem.classList.contains("backdrop")) {
    elem.closest(".modal").classList.remove("show");
    closeModal(elem);
  }

  // close modal on close button click
  if (elem.classList.contains("close-modal")) {
    elem.closest(".modal").classList.remove("show");
    document.body.style.overflow = "auto";
  }

  // OPEN MODALS
  if (e.target.id === "privacy-termsOfUseButton") {
    const modal = document.getElementById("privacy-termsOfUseModal");
    if (modal) {
      openModal(modal);
    }
  }

  if (e.target.id === "privacy-privacyNoticeButton") {
    const modal = document.getElementById("privacy-privacyNoticeModal");
    if (modal) {
      openModal(modal);
    }
  }

  // ABOUT US
  if (e.target.id === "expend-hisotry-button") {
    const exendWrapper = document.querySelector(
      ".about-section-history-content-expend"
    );
    const historyContainer = document.querySelector(
      ".about-section-history-content-layout"
    );

    historyContainer.style.maxHeight = "100%";
    historyContainer.style.overflow = "auto";
    exendWrapper.remove();
  }

  if (
    e.target.className === "print-button" ||
    e.target.closest(".print-button")
  ) {
    print();
  }
});
