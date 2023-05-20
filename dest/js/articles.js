import { QUERY_LINK, DAYS, MONTHS, DEFAULT_IMAGE } from "./backlink.js";
const link = QUERY_LINK + 'articles';
const articlesContainer = document.querySelector('.articles__items');
let sortType = 'new';
let categoriesType = 0;


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
      <a class="article__stats-like-field">
        <p class="article__stats-likes">30</p>
        <button class="article__like-button">
          <img src="../dest/images/like.png" alt="like">
        </button>
      </a>
    </div>
  </div>
`;
  if (!articles) {
    const header = articlesContainer.querySelector('.articles__header');
    articlesContainer.innerHTML = '';
    articlesContainer.append(header);
    header.innerHTML = 'Постів не знайдено';
    return false;
  }
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
      const articles = await getArticles(0, 15, sortType, categoriesType);
      outArticles(articles.response);
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
    categoryItem.textContent = category.name;
    categoryItem.value = category.id;
    categoriesContainer.appendChild(categoryItem);
  });
  categoriesContainer.addEventListener('change', async e => {
    e.preventDefault();
    const load = document.createElement('img');
    load.classList.add('load__img');
    load.src = '../dest/images/loading.png';
    const articleList = document.querySelector('.articles__list');
    articleList.innerHTML = '';
    articleList.appendChild(load);
    categoriesType = e.target.value;
    const articles = await getArticles(0, 15, sortType, categoriesType);
    outArticles(articles.response);
  });
}

async function main() {
  const load = document.createElement('img');
  load.classList.add('load__img');
  load.src = '../dest/images/loading.png';
  const articleList = document.querySelector('.articles__list');
  articleList.innerHTML = '';
  articleList.appendChild(load);
  const articles = await getArticles(0, 15, sortType, categoriesType);
  const outResult = outArticles(articles.response);
  setSort();
  await setCategories();
}

main();

