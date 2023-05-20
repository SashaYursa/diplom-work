import { QUERY_LINK, DAYS, MONTHS, DEFAULT_IMAGE } from "./backlink.js";
import { getUser } from "./checkUser.js";
const userToken = sessionStorage.getItem('user_token') || localStorage.getItem('user_token') || 0;
const articleLink = QUERY_LINK + 'articles';
const articleImagesLink = QUERY_LINK + 'articles/images/';
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const itemID = urlParams.get('id').replace(/\D/g, "");
let userID;
async function getArticle(id) {
  const response = await fetch(articleLink + '?id=' + id, {
    method: 'GET',
    headers: {
      'Status': 'get-for-article-page',
    }
  });
  return await response.json();
}
async function getAnotherArticles(limit, offset) {
  const response = await fetch(articleLink + '?limit=' + limit + '&offset=' + offset, {
    method: 'GET',
    headers: {
      'Status': 'get-another-articles'
    }
  });
  return await response.json();
}

function setArticle(article) {
  let field = document.querySelector('.article__text');
  field.innerHTML = article.text;
  let images = field.querySelectorAll('img');
  images.forEach(image => {
    let split = image.src.split('/');
    image.src = QUERY_LINK + 'articles/images/' + split[split.length - 1];
  });
  const header = document.querySelector('.article__name');
  header.textContent = article.name;
  const createdAt = document.querySelector('.article__time');
  setDate(article.created_at, createdAt);
  const author = document.querySelector('.article__author');
  author.textContent = article.author.name;
  const authorImage = document.querySelector('.author-image');
  article.author.image === 'empty'
    ? authorImage.src = DEFAULT_IMAGE
    : authorImage.src = QUERY_LINK + 'UserImages/' + article.author.image;
  const views = document.querySelector('.article__views');
  views.textContent = article.views;
  const likesCount = document.querySelector('.article__likes-count');
  likesCount.textContent = article.likes;
}

function setAnotherArticles(articles) {
  const field = document.querySelector('.article__nav-body');
  field.innerHTML = '';
  articles.forEach(article => {
    let articleItem = document.createElement('div');
    articleItem.classList.add('article__nav-item');
    let articleLink = document.createElement('a');
    articleLink.classList.add('article__nav-link');
    articleLink.textContent = article.name;
    articleLink.href = '/article/?id=' + article.id;
    let artilcleDate = document.createElement('span');
    artilcleDate.classList.add('article__nav-created-at');
    setDate(article.created_at, artilcleDate);
    articleItem.appendChild(articleLink);
    articleItem.appendChild(artilcleDate);
    field.appendChild(articleItem);
  });
}

function setComments(comments) {
  const commentsField = document.querySelector('.article__all-comments');
  commentsField.innerHTML = '';
  comments.forEach(comment => {
    let commentItem = document.createElement('div')
    commentItem.classList.add('.article__comment');
    let template = `
      <div class="comment__user-information">
        <img class="comment__user-image" src="../dest/images/default-background.webp" alt="image">
        <div class="comment__info">
          <span class="comment__user-name"></span>
          <span class="comment__created-at"></span>
        </div>
      </div>
      <p class="comment__text">
      </p>
    `;
    let deleteButton = `
    <button id="${comment.id}" class="comment__delete">
      <img class="delete-img" src="../dest/images/remove.png"/>
    </button>
    `;
    commentItem.innerHTML = template;
    let commentUserName = commentItem.querySelector('.comment__user-name');
    let commentUserImage = commentItem.querySelector('.comment__user-image');
    let commentCreatedAt = commentItem.querySelector('.comment__created-at');
    let commentText = commentItem.querySelector('.comment__text');
    commentText.textContent = comment.text;
    commentUserName.textContent = comment.login;
    setDate(comment.created_at, commentCreatedAt);
    if (comment.creator_id === userID) {
      const commentUserInformation = commentItem.querySelector('.comment__user-information');
      commentUserInformation.innerHTML += deleteButton;
      const deleteButtonElement = commentUserInformation.querySelector('.comment__delete');
      addDeleteCommentEvent(deleteButtonElement);
    }
    if (comment.user_image !== 'empty') commentUserImage.src = QUERY_LINK + 'UserImages/' + comment.user_image;
    commentsField.appendChild(commentItem);
  });
}

function addDeleteCommentEvent(button) {
  button.addEventListener('click', async e => {
    e.preventDefault();
    let response = await fetch(QUERY_LINK + 'articleComment?id=' + button.id + '&articleID=' + itemID, {
      method: 'DELETE',
    });
    response = await response.json();
    setComments(response);
  })
}

async function main() {
  const user = await getUser(userToken);
  userID = user['id'];
  const article = await getArticle(itemID);
  if (article.response != undefined || article.hide != 0) {
    return location = '/404/';
  }
  setArticle(article);
  setComments(article.comments);

  const anotherArticles = await getAnotherArticles(15, 0);
  setAnotherArticles(anotherArticles);

  const likesField = document.querySelector('.article__likes');
  addLikesEvent(likesField);
}

main();

function addLikesEvent(likesField) {
  const likesCount = likesField.querySelector('.article__likes-count');
  const likesButton = likesField.querySelector('.article__likes-button');
  likesButton.addEventListener('click', async e => {
    e.preventDefault();
    if (!userID) {
      return;
    }
    await fetch(articleLink + '?uid=' + userID + '&id=' + itemID, {
      method: 'PATCH',
      headers: {
        'status': 'add-like'
      }
    })
      .then(res => res.json())
      .then(res => {
        document.querySelector('.article__likes-count').textContent = res.likes;
      })
  });
}

function setDate(timestamp, field) {
  const date = new Date(timestamp);
  const dateNow = new Date();
  if (date.getDate() == dateNow.getDate() && date.getFullYear() == dateNow.getFullYear() && date.getMonth() == dateNow.getMonth()) {
    field.textContent = 'сьогодні ' + (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
  }
  else if (date.getDate() === dateNow.getDate() - 1 && date.getFullYear() == dateNow.getFullYear() && date.getMonth() == dateNow.getMonth()) {
    field.textContent = 'вчора ' + (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
  }
  else {
    field.textContent = DAYS[date.getDay()] + ' ' + date.getDay() + ' ' + MONTHS[date.getMonth()] + ' ' + date.getFullYear();
  }
}

const commentButton = document.querySelector('.comment__send');
let comment = document.querySelector('.comment__content');

commentButton.addEventListener('click', async e => {
  e.preventDefault();
  if (userToken === 0) {
    location = '../login/';
  }
  if (comment.value.length > 1) {
    const comments = await addComment(comment.value, userToken, itemID);
    setComments(comments);
  }

});

async function addComment(comment, userToken, articleID) {
  const formData = new FormData();
  formData.append('userToken', userToken);
  formData.append('comment', comment);
  formData.append('articleID', articleID);
  let response = await fetch(QUERY_LINK + 'articleComment', {
    method: 'POST',
    headers: {
      'Status': 'add-comment'
    },
    body: formData
  });
  return await response.json();
}
