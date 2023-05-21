import { QUERY_LINK } from "./backlink.js";
import { outPopup } from "./popup.js";
const userToken = sessionStorage.getItem('user_token') || localStorage.getItem('user_token') || 0;
const userImageLink = QUERY_LINK + 'UserImages/';
const portfolioLink = QUERY_LINK + 'arts';
const userLink = QUERY_LINK + 'users';
let data;
let user;
async function getUser(token) {
  let newlink = userLink + '?token=' + token;
  let response = await fetch(newlink);
  return await response.json();
}

const urlParams = new URLSearchParams(window.location.search);
let myParam = urlParams.get('page') || 1;
const ItemsInPage = 15;
let itemsCount = ItemsInPage * (myParam - 1);
let offset = itemsCount + ItemsInPage;

let pageCount;
let pages;

loadData(1);


async function loadData(page) {
  await getCountPages(ItemsInPage);
  await loadImages(page);
  addPopups();
  user = await getUser(userToken);
  displayPagination();
}

async function getCountPages(items) {
  let newLink = portfolioLink + '?itemsInPage=' + items;
  let response = await fetch(newLink, {
    method: 'GET',
    headers: {
      "Content-type": "application/json;",
      "status": "get-count-pages",
    }
  });
  const responseData = await response.json();
  pageCount = responseData.countPages;
  pages = responseData.pages;
}

async function displayPagination() {
  const paginationElement = document.querySelector('.pagination');
  paginationElement.innerHTML = '';
  const startElement = document.createElement("a");

  startElement.classList.add('pagination__item');
  startElement.innerText = '«';
  paginationElement.appendChild(startElement);
  startElement.addEventListener('click', (e) => {
    e.preventDefault();
    myParam = 1;
    itemsCount = ItemsInPage * (myParam - 1);
    offset = itemsCount + ItemsInPage;
    loadData(1);
    window.scrollTo(0, 0)
  });

  for (let i = 0; i < pageCount; i++) {
    let paginationItem = createPaginationItem(i + 1);
    paginationElement.appendChild(paginationItem);
    paginationItem.addEventListener('click', (e) => {
      e.preventDefault();

      myParam = paginationItem.innerText;
      itemsCount = ItemsInPage * (myParam - 1);
      offset = itemsCount + ItemsInPage;
      loadData(i + 1);
      window.scrollTo(0, 0);
    });
  }

  const endElement = document.createElement("a");
  endElement.classList.add('pagination__item');
  endElement.innerText = '»';
  paginationElement.appendChild(endElement);
  endElement.addEventListener('click', (e) => {
    e.preventDefault();
    myParam = pageCount;
    itemsCount = ItemsInPage * (myParam - 1);
    offset = itemsCount + ItemsInPage;
    loadData(pageCount);
    window.scrollTo(0, 0)
  });
}

function createPaginationItem(page) {
  const paginationElement = document.createElement("a");
  paginationElement.classList.add('pagination__item');
  paginationElement.innerText = page;
  if (paginationElement.innerText == myParam) {
    paginationElement.classList.add('active');
  }
  return paginationElement;
}

function createElement(id, portfolioItems) {
  portfolioItems.innerHTML += `
  <div class="portfolio__item" id="portfolio-item-${id + 1}">
  <a href="#popup" class="portfolio__link">
    <img class="portfolio__image" id="${id + 1}" src="../dest/images/default-background.webp" alt="portfolio-item">
    <span class="portfolio__details" id="desc${id + 1}">Дивитися</span>
    <span class="portfolio__id" hidden id="itemID${id + 1}"></span>
  </a>
</div>
  `;
}

async function addImageInfo(item, id) {
  let newLink = portfolioLink + '?item=' + item;
  let response = await fetch(newLink, {
    method: 'GET',
    headers: {
      "Content-type": "application/json;",
      "status": "get-info",
    }
  });
  if (response.ok) {
    let data = await response.json();
    const imageItem = document.getElementById('desc' + (id + 1));
    const imageItemID = document.getElementById('itemID' + (id + 1));
    imageItem.innerText = data['name'];
    imageItemID.innerText = data['id'];
    if (data['res'] != undefined) {
      imageItem.innerText = data['res']['name'];
      imageItemID.innerText = data['res']['id'];
    }
    return data;
  }
  return false;

}
async function loadImages(page) {

  const portfolioItems = document.querySelector('.portfolio__items');
  portfolioItems.innerHTML = '';
  for (const i in pages[page]) {
    createElement(i, portfolioItems);
    let data = await addImageInfo(pages[page][i].id, i);
    if (data['res'] != undefined) {
      await addImage(i, data.portfolio_logo, false);
    } else {
      await addImage(i, data.portfolio_logo);
    }
  }
}
async function addImage(item, link, data = true) {
  if (!data) {
    const imageItem = document.getElementById(item + 1);
    imageItem.src = '../dest/images/default-background.webp';
  }
  else {
    const logoLink = QUERY_LINK + 'portfolio/logo/' + link;
    const imageItem = document.getElementById(item + 1);
    imageItem.src = logoLink;
  }
}
/////////////////////////////////////////////////////////////////
//popup

function addPopups() {
  let popupLinks = document.querySelectorAll('.portfolio__link');
  if (popupLinks.length > 0) {
    popupLinks.forEach(popupLink => {
      popupLink.addEventListener('click', async (e) => {
        e.preventDefault();
        let popupName = popupLink.getAttribute('href').replace('#', '');
        let itemID = popupLink.querySelector('.portfolio__id').textContent;
        let currentPopup = document.getElementById(popupName);
        await outPopup(itemID, currentPopup, user.id);
      })
    });
  }
}
