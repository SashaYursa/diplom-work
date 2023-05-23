import { QUERY_LINK } from "./backlink.js";

const searchSubmit = document.querySelector('.search__submit-button');
const searchInput = document.querySelector('.search__input');
const searchLink = QUERY_LINK + 'search';
const queryString = window.location.search;
const errorField = document.querySelector('.error-field');
const params = new URLSearchParams(queryString);
const searchParam = params.get('q');
let search = {
  works: true,
  users: true,
  articles: true,
};
if (searchParam !== null) {
  run();
}



let filterButtons = document.querySelectorAll('.search-filter__item');
filterButtons.forEach(button => {
  button.addEventListener('click', e => {
    e.preventDefault();
    let param = button.id;
    const title = document.querySelector('.' + button.id + '-title');
    const body = document.querySelector('.' + button.id + '__items');
    if (button.classList.contains('active')) {
      button.classList.remove('active');
      search[param] = false;
      title.classList.add('hide');
      body.classList.add('hide');
      for (const i in search) {
        if (search[i]) {
          return;
        }
      }
      title.classList.remove('hide');
      body.classList.remove('hide');
      button.classList.add('active');
      search[param] = true;
    } else {
      search[param] = true;
      button.classList.add('active');
      title.classList.remove('hide');
      body.classList.remove('hide');
    }
  });
});

async function run() {
  const response = await getResponse(searchParam, search);
  outElements(response);
}

searchSubmit.addEventListener('click', async e => {
  e.preventDefault();

  if (searchInput.value.length === 0) {
    return outError('Будь-ласка введіть дані для пошуку', errorField);
  } else {
    const response = await getResponse(searchInput.value, search);
    outElements(response);
  }

});
async function getResponse(value, param) {
  let newLink = searchLink + '?value=' + value + '&params=';
  for (const i in param) {
    if (param[i] == true) {
      newLink += i + '+';
    }
  }
  newLink = newLink.slice(0, -1);
  let response = await fetch(newLink, {
    method: 'GET',
  });
  return await response.json();
  // errorField.innerHTML = '';
  // outElements(response);
  // else {
  //   return outError('Записів не знайдено', errorField);
  // }
}

function outElements(items) {
  const users = items.users;
  const works = items.works;
  const articles = items.articles;
  if (users != undefined) {
    outUsers(users);
  }
  if (works != undefined) {
    outWorks(works);
  }
  if (articles != undefined) {
    outArticles(articles);
  }
}

function outUsers(users) {
  const usersTitle = document.querySelector('.users-title');
  const usersItems = document.querySelector('.users__items');
  usersItems.innerHTML = '';
  if (users.length < 1) {
    usersTitle.innerHTML = 'Користувачів не знайдено';
    return
  }
  usersTitle.innerHTML = 'Користувачі';
  const userImageLink = QUERY_LINK + 'UserImages/';

  for (const key in users) {
    const element = users[key];
    let userItem = document.createElement('div');
    userItem.classList.add('user__item');
    let userImage = document.createElement('div');
    userImage.classList.add('user__img');
    let image = document.createElement('img');
    userImage.appendChild(image);
    let userValues = document.createElement('a');
    userValues.classList.add('user__values');
    let userName = document.createElement('span');
    userName.classList.add('user__name');
    let userEmail = document.createElement('span');
    userEmail.classList.add('user__email');
    userValues.appendChild(userName);
    userValues.appendChild(userEmail);

    userItem.id = 'user-' + element.id;
    if (element.user_image !== 'empty') {
      image.src = userImageLink + element.user_image;
    } else {
      image.src = '../dest/images/default-background.webp';
    }

    userValues.href = '../';
    userName.textContent = "Ім'я: " + element.login;
    userEmail.textContent = "Email: " + element.email;
    userItem.appendChild(userImage);
    userItem.appendChild(userValues);
    usersItems.appendChild(userItem);
  }
}
function outWorks(works) {
  const worksItems = document.querySelector('.works__items');
  worksItems.innerHTML = '';
  const worksTitle = document.querySelector('.works-title');
  if (works.length < 1) {
    worksTitle.innerHTML = 'Робіт не знайдено';
    return
  }
  worksTitle.innerHTML = 'Роботи';
  const workImageLink = QUERY_LINK + 'portfolio/logo/';
  for (const key in works) {
    const element = works[key];
    let workItem = document.createElement('div');
    workItem.classList.add('work__item');
    let workImage = document.createElement('div');
    workImage.classList.add('work__img');
    let image = document.createElement('img');
    workImage.appendChild(image);
    let workValues = document.createElement('a');
    workValues.classList.add('user__values');
    let workName = document.createElement('span');
    workName.classList.add('user__name');
    let workDesc = document.createElement('span');
    workDesc.classList.add('user__email');
    workValues.appendChild(workName);
    workValues.appendChild(workDesc);

    workItem.id = 'user-' + element.id;
    if (element.portfolio_logo !== 'empty') {
      image.src = workImageLink + element.portfolio_logo;
    } else {
      image.src = '../dest/images/default-background.webp';
    }
    workName.textContent = element.name;
    workDesc.textContent = element.description;
    workItem.appendChild(workImage);
    workItem.appendChild(workValues);
    worksItems.appendChild(workItem);
  }
}

function outArticles(articles) {
  const articlesTitle = document.querySelector('.articles-title');
  const articleItems = document.querySelector('.articles__items');
  articleItems.innerHTML = '';
  if (articles.length < 1) {
    articlesTitle.innerHTML = 'Постів не знайдено';
    return;
  }
  articlesTitle.innerHTML = 'Пости';
  const template = `
    <div class="article__image">
      <img class="article-img" src="../dest/images/default-background.webp" alt="article image">
    </div>
    <a class="article__info">
      <span class="article__name"></span>
      <span class="article__description"></span>
      <div class="article__stats">
        <div class="article__likes">
          <img class="like-img" src="../dest/images/like.png" alt="likes">
          <span class="article__likes-count"></span>
        </div>
        <div class="article__views">
          <img class="views-img" src="../dest/images/eye.png" alt="views">
          <span class="article__views-count"></span>
        </div>
      </div>
    </a>
  `;
  const articleImageLink = QUERY_LINK + 'articles/images/';

  for (const key in articles) {
    const element = articles[key];
    let articleBody = document.createElement('div');
    articleBody.classList.add('article__item');
    articleBody.innerHTML = template;
    articleBody.id = element.id;
    if (element.logo !== 'empty') {
      articleBody.querySelector('.article-img').src = articleImageLink + element.logo;
    }
    element.name.length > 80
      ? articleBody.querySelector('.article__name').textContent = element.name.slice(0, 80) + '...'
      : articleBody.querySelector('.article__name').textContent = element.name;
    element.description.length > 240
      ? articleBody.querySelector('.article__description').textContent = element.description.slice(0, 240) + '...'
      : articleBody.querySelector('.article__description').textContent = element.description;
    articleBody.querySelector('.article__likes-count').textContent = element.likes;
    articleBody.querySelector('.article__views-count').textContent = element.views;
    articleBody.querySelector('.article__info').href = '../article?id=' + element.id;
    articleItems.appendChild(articleBody);
  }
}


function outError(error, errorField) {
  document.querySelector('.user-title').innerHTML = '';
  document.querySelector('.work-title').innerHTML = '';
  document.querySelector('.users__items').innerHTML = '';
  document.querySelector('.works__items').innerHTML = '';

  let errorItem = document.createElement('span');
  errorItem.textContent = error;
  errorField.innerHTML = '';
  errorField.appendChild(errorItem);
}

