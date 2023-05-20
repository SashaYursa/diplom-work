import { QUERY_LINK, DAYS, MONTHS } from "./backlink.js";
const mainLink = QUERY_LINK + 'main';
const portfolioLogoLink = QUERY_LINK + 'portfolio/logo/';
main();
async function outPage() {
  let works = await getMostPopularWork(mainLink);
  if (!works) {
    return;
  }
  let mostPopularWork = works.mostPopular;
  let popularWorks = works.popularWorks;
  const header = document.querySelector('.content__header');
  mostPopularWork.name.length > 120
    ? header.textContent = mostPopularWork.name.slice(0, 120) + '...'
    : header.textContent = mostPopularWork.name;
  const desc = document.querySelector('.content__description');
  mostPopularWork.description.length > 240
    ? desc.textContent = mostPopularWork.description.slice(0, 240) + '...'
    : desc.textContent = mostPopularWork.description;
  // let date = mostPopularWork.created_at.split(' ');
  // date = date[0].replace(/-/g, '.');
  const dateContent = document.querySelector('.content__date');
  setDate(mostPopularWork.created_at, dateContent);
  const backgroundImage = document.querySelector('.background-image');
  backgroundImage.src = portfolioLogoLink + mostPopularWork.portfolio_logo;
  addPopularWorks(popularWorks);
  let articles = await getMostPopularArticles(QUERY_LINK + 'articles');
  addPopularArticles(articles);
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
      <a class="topic__link desc-link" href="#">
        <p class="topic__description">
        </p>
      </a>
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
    let workDesc = workItem.querySelector('.topic__description');
    workDesc.textContent = item.description;
    let workImage = workItem.querySelector('.topic__image');
    workImage.src = portfolioLogoLink + item.portfolio_logo;
    let date = item.created_at.split(' ');
    date = date[0].replace(/-/g, '.');
    let workDate = workItem.querySelector('.topic__date');
    workDate.textContent = date;
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
    <span class="tag tag-teal"></span>
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
    let card = document.createElement('div');
    card.classList.add('card');
    card.innerHTML = template;
    let articleImage = card.querySelector('.articleImage');
    let tag = card.querySelector('.tag');
    let articleHeader = card.querySelector('.articleHeader');
    let articleDesc = card.querySelector('.articleDesc');
    let userImage = card.querySelector('.userImage');
    let userName = card.querySelector('.userName');
    let createdAt = card.querySelector('.createdAt');
    tag.textContent = article.category.name;
    articleHeader.textContent = article.name;
    articleDesc.textContent = article.description;
    userImage.src = QUERY_LINK + article.user_image;
    userName = article.login;
    setDate(article.created_at, createdAt);
    articleImage.src = QUERY_LINK + article.logo;
    articleContainer.appendChild(card);
  });
  console.log(articles);
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

