import { navBarHeighlighter } from "./menu";

const route = (event) => {
  event = event || window.event;
  event.preventDefault();
  window.history.pushState({}, "", event.target.href);
  handleLocation();
};

const routes = {
  "/notFound": "/not-found.html",
  "/": "/apply.html",
  "/about": "/about.html",
  "/contact": "/contact.html",
  "/faq": "/faq.html",
  "/loans": "/loans.html",
  "/online-privacy-notice": "/online-privacy-notice.html",
  "/privacy": "/privacy.html",
  "/rates": "/rates.html",
  "/resources": "/resources.html",
  "/terms": "/terms.html",
};

const handleLocation = async () => {
  const path = window.location.pathname;
  const route = routes[path] || routes["/notFound"];
  const mainPage = document.getElementById("main-page");
  if (mainPage) {
    mainPage.style.opacity = 0;
    // FETCH PAGE REQUESTED PAGE HTML
    const html = await fetch(route).then((data) => data.text());
    mainPage.innerHTML = html;
    mainPage.style.opacity = 1;
    window.scroll({
      top: 0,
      left: 0,
      behavior: "smooth",
    });

    // HIGHLIGHT NAV BUTTONS ON ROUTE CHANGE
    navBarHeighlighter(path);
  }
};

window.onpopstate = handleLocation;
window.route = route;

handleLocation();
