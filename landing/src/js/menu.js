const burgerBtn = document.getElementById("burder-menu-btn");
const menu = document.getElementById("menu-lg");
const menubackdrop = document.getElementById("menu-backdrop");

const openMenu = () => {
  menu.classList.add("show");
  menubackdrop.classList.add("show");
};

export const closeMenu = () => {
  menu.classList.remove("show");
  menubackdrop.classList.remove("show");
};

const toggleMenu = () => {
  if (menu) {
    if (menu.classList.contains("show")) {
      closeMenu(menu);
    } else {
      openMenu(menu);
    }
  }
};

if (burgerBtn) {
  burgerBtn.addEventListener("click", function() {
    toggleMenu();
  });
}

if (menubackdrop) {
  menubackdrop.addEventListener("click", function() {
    closeMenu();
  });
}

const unselectTab = () => {
  const navs = document.querySelectorAll("nav");
  const navsArr = Array.from(navs);
  navsArr.forEach((nav) => {
    const selected = nav.querySelectorAll(".selected");
    const selectedArr = Array.from(selected);
    selectedArr.forEach((item) => item.classList.remove("selected"));
  });
};

// HIGHLIGHT NAVIGATION BUTTONS ON ROUTE CHANGE
export const navBarHeighlighter = (path) => {
  unselectTab();
  closeMenu();
  // HIGHLIGH ALL THE NAV LINKS USED TO CAPTURE SAME LINK ON MOBILE DEVICES MENU
  const links = document.querySelectorAll(`.navlink[href='${path}']`);
  if (links && links.length) {
    Array.from(links).forEach((link) => {
      link.classList.add("selected");
    });
  }
};
