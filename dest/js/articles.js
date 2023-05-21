import { QUERY_LINK, DAYS, MONTHS, DEFAULT_IMAGE } from "./backlink.js";
const link = QUERY_LINK + 'articles';
const articlesContainer = document.querySelector('.articles__items');
const urlParams = new URLSearchParams(window.location.search);

const ItemsInPage = 15;
let page;
let pages;
let user;


let categoriesType = 0;
if (urlParams.size) {
  const categoryID = urlParams.get('cat').replace(/\D/g, "");
  let category = await checkCategory(categoryID);
  if (category) {
    categoriesType = categoryID;
  }
}
let sortType = 'new';
async function checkCategory(catID) {
  let response = await fetch(QUERY_LINK + 'categories' + '?catID=' + catID, {
    method: 'GET'
  });
  response = await response.json();
  return response;
}

async function getCountPages(items) {
  let newLink = link + '?itemsInPage=' + items + '&catID=' + categoriesType;
  let response = await fetch(newLink, {
    method: 'GET',
    headers: {
      "status": "get-count-pages",
    }
  });
  const responseData = await response.json();
  pages = responseData.countPages;
}

async function getArticles(offset, limit, sortType, categoriesType) {
  const newLink = link + '?offset=' + offset + '&limit=' + limit + '&sortType=' + sortType + '&categories=' + categoriesType;
  const response = await fetch(newLink, {
    method: 'GET',
  });
  if (response !== '') {
    return response.json();
  }
  return false;
}

function outArticles(articles) {

  const articleTemplate = `
  <div class="article__image">
    <img class="article-img" src="../dest/images/example-pict.webp" alt="pict">
  </div>
  <div class="article__content">
    <div class="article__author">
      <div class="article__author-image">
        <img class="author-img" src="../dest/images/example-pict.webp" alt="author">
      </div>
      <div class="article__author-content">
        <h3 class="article__author-name"></h3>
        <div class="article__date">
          <p class="article__date-published"></p>
        </div>
      </div>
    </div>
    <a class="article__description">
      <h2 class="article__description-header">
      </h2>
      <p class="article__description-content">
      </p>
    </a>
    <div class="article__stats">
      <div class="article__coment-count stats">
      <img src="../dest/images/comment.png" alt="comments">
        <p class="article__stats-comments"></p>
      </div>
      <div class="article__views-count stats">
        <img src="../dest/images/eye.png" alt="views">
        <p class="articles__stats-views"></p>
      </div>
      <div class="article__stats-like-field">
        <p class="article__stats-likes">30</p>
        <div class="article__like-button">
          <img src="../dest/images/like.png" alt="like">
        </div>
      </div>
    </div>
  </div>
`;
  const header = articlesContainer.querySelector('.articles__header');
  if (!articles) {
    document.querySelector('.articles__list').innerHTML = '';
    header.innerHTML = 'Постів не знайдено';
    return false;
  }
  header.innerHTML = 'Пости';
  let articlesList = articlesContainer.querySelector('.articles__list');
  articlesList.innerHTML = '';
  for (const i in articles) {
    let article = articles[i];
    let articleItem = document.createElement('div');
    articleItem.classList.add('articles__item');
    articleItem.innerHTML = articleTemplate;
    let articleImg = articleItem.querySelector('.article-img');
    article.logo === 'empty'
      ? articleImg.src = '..' + DEFAULT_IMAGE
      : articleImg.src = QUERY_LINK + article.logo;
    let articleDescriptionHeader = articleItem.querySelector('.article__description-header');
    article.name.length > 49
      ? articleDescriptionHeader.textContent = article.name.slice(0, 49) + '...'
      : articleDescriptionHeader.textContent = article.name;

    let articleDescriptionContent = articleItem.querySelector('.article__description-content');
    article.description.length > 350
      ? articleDescriptionContent.textContent = article.description.slice(0, 350) + '...'
      : articleDescriptionContent.textContent = article.description;
    let authorImg = articleItem.querySelector('.author-img');
    article.user_image === 'empty'
      ? authorImg.src = '..' + DEFAULT_IMAGE
      : authorImg.src = QUERY_LINK + article.user_image;
    let articleAuthorName = articleItem.querySelector('.article__author-name');
    article.login.length > 40
      ? articleAuthorName.textContent = article.login.slice(0, 40) + '...'
      : articleAuthorName.textContent = article.login;
    let articleDatePublished = articleItem.querySelector('.article__date-published');
    setDate(article.created_at, articleDatePublished);

    let articleStatsComments = articleItem.querySelector('.article__stats-comments');
    articleStatsComments.textContent = article.coments_count;
    let articleStatsViews = articleItem.querySelector('.articles__stats-views');
    articleStatsViews.textContent = article.views;
    let articleStatsLikes = articleItem.querySelector('.article__stats-likes');
    articleStatsLikes.textContent = article.likes_count;
    articlesList.appendChild(articleItem);

    let articleLink = articleItem.querySelector('.article__description');

    articleLink.href = '../article?id=' + article.id;
    const articleLikeButton = articleItem.querySelector('.article__like-button');
  }
}

function setDate(timestamp, field) {
  const date = new Date(timestamp);
  const dateNow = new Date();
  if (date.getDate() == dateNow.getDate() && date.getFullYear() == dateNow.getFullYear() && date.getMonth() == dateNow.getMonth()) {
    field.textContent = 'Додано: сьогодні ' + (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
  }
  else if (date.getDate() === dateNow.getDate() - 1 && date.getFullYear() == dateNow.getFullYear() && date.getMonth() == dateNow.getMonth()) {
    field.textContent = 'Додано: вчора ' + (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
  }
  else {
    field.textContent = 'Додано: ' + DAYS[date.getDay()].slice(0, 3) + '. ' + date.getDay() + ' ' + MONTHS[date.getMonth()].slice(0, 3) + '. ' + date.getFullYear();
  }
}

async function setSort() {
  let sortsButton = document.querySelectorAll('.filter__button');
  sortsButton.forEach(button => {
    button.addEventListener('click', async e => {
      e.preventDefault();
      if (button.classList.contains('active')) {
        return;
      }
      const load = document.createElement('img');
      load.classList.add('load__img');
      load.src = '../dest/images/loading.png';
      const articleList = document.querySelector('.articles__list');
      articleList.innerHTML = '';
      articleList.appendChild(load);
      sortsButton.forEach(b => {
        b.classList.remove('active');
      });
      button.classList.add('active');
      sortType = button.id;
      page = 1;
      const articles = await getArticles((page - 1), ItemsInPage, sortType, categoriesType);
      outArticles(articles.response);
      displayPagination();
    });
  });
}

async function setCategories() {
  let categories = await fetch(link, {
    method: 'GET',
    headers: {
      'status': 'get-categories'
    }
  })
  categories = await categories.json();
  const categoriesContainer = document.querySelector('.article__categories');
  categoriesContainer.innerHTML = '';
  let categoryFirstItem = document.createElement('option');
  categoryFirstItem.textContent = 'Всі';
  categoryFirstItem.value = 0;
  categoriesContainer.appendChild(categoryFirstItem);
  categories.forEach(category => {
    let categoryItem = document.createElement('option');
    categoryItem.id = 'option-' + category.id;
    categoryItem.textContent = category.name;
    categoryItem.value = category.id;
    categoriesContainer.appendChild(categoryItem);
  });
  if (categoriesType > 0) {
    let option = document.getElementById('option-' + categoriesType);
    option.setAttribute('selected', 'selected');
  }
  categoriesContainer.addEventListener('change', async e => {
    e.preventDefault();
    const load = document.createElement('img');
    load.classList.add('load__img');
    load.src = '../dest/images/loading.png';
    const articleList = document.querySelector('.articles__list');
    articleList.innerHTML = '';
    articleList.appendChild(load);
    categoriesType = e.target.value;
    page = 1;
    const articles = await getArticles((page - 1), ItemsInPage, sortType, categoriesType);
    outArticles(articles.response);
    await getCountPages(ItemsInPage);
    page = 1;
    displayPagination();
  });
}
async function displayPagination() {
  const paginationElement = document.querySelector('.pagination');
  paginationElement.innerHTML = '';
  const startElement = document.createElement("a");

  startElement.classList.add('pagination__item');
  startElement.innerText = '«';
  paginationElement.appendChild(startElement);
  startElement.addEventListener('click', async (e) => {
    e.preventDefault();
    if (page == 1) {
      return;
    }
    page = page - 1;
    const articles = await getArticles((page - 1) * ItemsInPage, ItemsInPage, sortType, categoriesType);
    outArticles(articles.response);
    paginationItemSetActive();
    window.scrollTo(0, 0)
  });

  for (let i = 0; i < pages; i++) {
    let paginationItem = createPaginationItem(i + 1);
    paginationElement.appendChild(paginationItem);
    paginationItem.addEventListener('click', async (e) => {
      e.preventDefault();
      page = i + 1;
      const articles = await getArticles((page - 1) * ItemsInPage, ItemsInPage, sortType, categoriesType);
      outArticles(articles.response);
      paginationItemSetActive();
      window.scrollTo(0, 0)
    });
  }

  const endElement = document.createElement("a");
  endElement.classList.add('pagination__item');
  endElement.innerText = '»';
  paginationElement.appendChild(endElement);
  endElement.addEventListener('click', async (e) => {
    e.preventDefault();
    if (pages < page + 1) {
      return;
    }
    page++;
    const articles = await getArticles((page - 1) * ItemsInPage, ItemsInPage, sortType, categoriesType);
    outArticles(articles.response);
    paginationItemSetActive()
    window.scrollTo(0, 0)
  });
}

function paginationItemSetActive() {
  const paginationList = document.querySelectorAll('.pagination__item');
  paginationList.forEach(paginationItem => {
    if (paginationItem.classList.contains('active')) {
      paginationItem.classList.remove('active');
    };
    if (paginationItem.textContent == page) {
      paginationItem.classList.add('active');
    }
  })
}

function createPaginationItem(pageText) {
  const paginationElement = document.createElement("a");
  paginationElement.classList.add('pagination__item');
  paginationElement.innerText = pageText;
  if (paginationElement.innerText == page) {
    paginationElement.classList.add('active');
  }
  return paginationElement;
}


async function main() {


  const load = document.createElement('img');
  load.classList.add('load__img');
  load.src = '../dest/images/loading.png';

  await getCountPages(ItemsInPage);
  page = 1;
  displayPagination();

  const articleList = document.querySelector('.articles__list');
  articleList.innerHTML = '';
  articleList.appendChild(load);

  const articles = await getArticles((page - 1), ItemsInPage, sortType, categoriesType);
  outArticles(articles.response);
  setSort();
  await setCategories();
}

main();

