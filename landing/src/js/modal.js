// PREVENT CONTENT SHIFT ON OPEN MODAL
const calcScroll = () => {
  const div = document.createElement("div");
  div.style.width = "50px";
  div.style.height = "50px";
  div.style.overflowY = "scroll";
  div.style.visibility = "hidden";
  document.body.appendChild(div);
  const scrollWidth = div.offsetWidth - div.clientWidth;
  div.remove();
  return scrollWidth;
};

// OPEN MODAL
export const openModal = (elem) => {
  if (!elem) throw Error("no element passed"); // this code removes vertical scroll
  elem.classList.add("show");
};

// CLOSE MODAL
export const closeModal = (elem) => {
  if (!elem) throw Error("no element passed");
  document.body.style.marginRight = `0px`;
  elem.classList.remove("show");
};

export const uploadDocument = async (docPath, parent) => {
  const html = await fetch(docPath).then((data) => data.text());
  parent.innerHTML = html;
};

