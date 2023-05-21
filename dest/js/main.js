import { QUERY_LINK, DAYS, MONTHS } from "./backlink.js";
import { outPopup } from "./popup.js";
import { getUser } from "./checkUser.js";
const userToken = sessionStorage.getItem('user_token') || localStorage.getItem('user_token') || 0;

const mainLink = QUERY_LINK + 'main';
const portfolioLogoLink = QUERY_LINK + 'portfolio/logo/';
let user;
if (userToken !== 0) {
  user = await getUser(userToken);
}
main();

async function outPage() {
  const popup = document.querySelector('.popup');
  let works = await getMostPopularWork(mainLink);
  const header = document.querySelector('.content__header');
  const desc = document.querySelector('.content__description');
  const dateContent = document.querySelector('.content__date');
  const backgroundImage = document.querySelector('.background-image');
  if (!works) {
    header.textContent = '';
    desc.textContent = '';
    backgroundImage.src = 'dest/images/background-image.png';
    dateContent.textContent = '';
  }
  else {
    let mostPopularWork = works.mostPopular;
    let popularWorks = works.popularWorks;
    mostPopularWork.name.length > 120
      ? header.textContent = mostPopularWork.name.slice(0, 120) + '...'
      : header.textContent = mostPopularWork.name;
    mostPopularWork.description.length > 240
      ? desc.textContent = mostPopularWork.description.slice(0, 240) + '...'
      : desc.textContent = mostPopularWork.description;
    setDate(mostPopularWork.created_at, dateContent);
    backgroundImage.src = portfolioLogoLink + mostPopularWork.portfolio_logo;
    document.querySelector('.header__content').addEventListener('click', e => {
      e.preventDefault();
      user?.id ? outPopup(mostPopularWork.id, popup, user.id) : outPopup(mostPopularWork.id, popup, undefined);
    });
    if (popularWorks) {
      addPopularWorks(popularWorks);
      addPopularWorksEvents(popup);
    }
  }
  let articles = await getMostPopularArticles(QUERY_LINK + 'articles');
  addPopularArticles(articles);
  let categories = await getCategories(QUERY_LINK + 'categories');
  const categoriesContainer = document.querySelector('.categories__container');
  categoriesContainer.innerHTML = '';
  categories.forEach(cat => {
    let categoryLink = document.createElement('a');
    categoryLink.classList.add('categories__item');
    categoryLink.textContent = cat.name + '-' + cat.posts.count;
    categoryLink.href = '/articles/?cat=' + cat.id;
    categoriesContainer.appendChild(categoryLink);
  });
}

function addPopularWorksEvents(popup) {
  let popularWorkLinks = document.querySelectorAll('.topic__link');
  popularWorkLinks.forEach(popularWorkLink => {
    popularWorkLink.addEventListener('click', e => {
      e.preventDefault();

      const id = popularWorkLink.querySelector('.topic__header').id;
      user?.id ? outPopup(id, popup, user.id) : outPopup(id, popup, undefined);
    });
  });
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

function addPopularWorks(popularWorks) {
  const popularWorksContainer = document.querySelector('.works__container');
  popularWorksContainer.innerHTML = '<h2 class="topics__header text-header">Популярні роботи</h2>';
  let workTemplate = `
  <div class="topic__item">
    <img class="topic__image" src="" alt="img">
    <div class="topic__text">
      <a class="topic__link" href="#">
        <h3 class="topic__header"></h3>
      </a>
        <p class="topic__description">
        </p>
      <div class="topic__attributes">
        <p class="topic__date">10.02.2022</p>
        <div class="topic__likes">
          <img class="topic__like-img" src="dest/images/like.png" alt"like-img"/>
          <span class="topic__like-count">0</span>
        </div>
      </div>
    </div>
  </div>
  `;
  if (popularWorks === undefined) {
    return;
  }
  for (const item of popularWorks) {
    let workItem = document.createElement('div');
    workItem.classList.add('topics__topic');
    workItem.innerHTML += workTemplate;
    let workHeader = workItem.querySelector('.topic__header');
    workHeader.textContent = item.name;
    workHeader.id = item.id;
    let workDesc = workItem.querySelector('.topic__description');
    workDesc.textContent = item.description;
    let workImage = workItem.querySelector('.topic__image');
    workImage.src = portfolioLogoLink + item.portfolio_logo;
    let workDate = workItem.querySelector('.topic__date');
    setDate(item.created_at, workDate);
    let workLikes = workItem.querySelector('.topic__like-count');
    workLikes.textContent = item.likes;


    popularWorksContainer.appendChild(workItem);
  }
}

function addPopularArticles(articles) {
  const articleContainer = document.querySelector('.articles__container');
  articleContainer.innerHTML = '';
  let template = `
  <div class="card-header">
    <img class="articleImage" src="" alt="article" />
  </div>
  <div class="card-body">
    <div class="card-info">
    <img class="card-likes" src="dest/images/like.png" alt"like-img"/>
    <span class="article-likes"></span>
    <img class="card-views" src="dest/images/eye.png" alt"views-img"/>
    <span class="article-views"></span>
    <span class="tag"></span>
    </div>
    <h4 class="articleHeader">
    </h4>
    <p class="articleDesc">
    </p>
    <div class="user">
      <img class="userImage"
        src=""
        alt="user" />
      <div class="user-info">
        <h5 class="userName"></h5>
        <small class="createdAt"></small>
      </div>
    </div>
  </div>
  `;
  articles.response.forEach(article => {
    const rndInt = Math.floor(Math.random() * 3) + 1;
    let card = document.createElement('div');
    card.classList.add('card');
    card.id = article.id;
    card.innerHTML = template;
    let articleImage = card.querySelector('.articleImage');
    let tag = card.querySelector('.tag');
    switch (rndInt) {
      case 1:
        tag.classList.add('tag-teal');
        break;
      case 2:
        tag.classList.add('tag-pink');
        break;
      case 3:
        tag.classList.add('tag-purple');
        break;
    }
    let articleHeader = card.querySelector('.articleHeader');
    let articleDesc = card.querySelector('.articleDesc');
    let userImage = card.querySelector('.userImage');
    let userName = card.querySelector('.userName');
    let createdAt = card.querySelector('.createdAt');
    let views = card.querySelector('.article-views');
    let likes = card.querySelector('.article-likes');
    tag.textContent = article.category.name;
    articleHeader.textContent = article.name;
    articleDesc.textContent = article.description;
    likes.textContent = article.likes_count;
    views.textContent = article.views;
    article.user_image === 'empty'
      ? userImage.src = 'dest/images/default-background.webp'
      : userImage.src = QUERY_LINK + article.user_image;
    userName.textContent = article.login;
    setDate(article.created_at, createdAt);
    article.logo === 'empty'
      ? articleImage.src = 'dest/images/default-background.webp'
      : articleImage.src = QUERY_LINK + article.logo;
    articleContainer.appendChild(card);
    card.querySelector('.card-body').addEventListener('click', e => {
      e.preventDefault();
      location = './article/?id=' + card.id;
    });
  });
}

async function getMostPopularWork(link) {
  let response = await fetch(link, {
    method: 'GET',
    headers: {
      'status': 'get-most-popular',
      'Content-Security-Policy': 'upgrade-insecure-requests',
    }
  });
  response = await response.json();
  return response;
}

async function getMostPopularArticles(link) {
  let response = await fetch(link, {
    method: 'GET',
    headers: {
      'status': 'get-most-popular',
      'Content-Security-Policy': 'upgrade-insecure-requests',
    }
  });
  response = await response.json();
  return response;
}

async function getCategories(link) {
  let response = await fetch(link, {
    method: 'GET',
    headers: {
      'status': 'get-all-categories'
    }
  });
  response = await response.json();
  return response;
}

async function main() {
  const header = document.querySelector('.header');
  const load = document.createElement('img');
  const loadContainer = document.createElement('div');
  loadContainer.classList.add('load__container');
  loadContainer.appendChild(load);
  load.classList.add('load__img');
  load.src = 'dest/images/loading.png';
  header.parentElement.appendChild(loadContainer)
  await outPage();
  header.parentElement.removeChild(document.querySelector('.load__container'));
  header.style.opacity = 1;
}

