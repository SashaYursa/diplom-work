import { QUERY_LINK } from '../backlink.js';

const commentLink = QUERY_LINK + 'admin/comments';
const imageLink = QUERY_LINK + 'UserImages/';
let { refresh } = await import('./loadItems.js');
async function getUsers() {
  let user = await fetch(usersLink);
  user = await user.json();
}

let ipnutImage;

async function addItemsHandler(userTemplate, userAccess) {
  let deleteButtons = userTemplate.querySelectorAll('.comment-delete-button');
  let editeButtons = userTemplate.querySelectorAll('.comment-edit-button');
  addDeleteHandler(deleteButtons);
  addEditHandler(editeButtons, userAccess);
}

function addDeleteHandler(buttons) {
  buttons.forEach(element => {
    element.addEventListener('click', async e => {
      e.preventDefault();
      let buttonID = element.id.split('-');
      if (confirm("Ви точно хочете видалити даний коментар?")) {
        if (await deleteComment(buttonID[1])) {
          await refresh('comments');
        }
      }
    });
  });
}

async function deleteComment(id) {
  let newLink = commentLink + '?id=' + id;
  let response = await fetch(newLink, {
    method: 'DELETE',
  });
  response = await response.json();
  if (response.status) {
    return true;
  }
  return false;
}

function addEditHandler(buttons, userAccess) {
  buttons.forEach(element => {
    element.addEventListener('click', async e => {
      e.preventDefault();
      let buttonID = element.id.split('-');
      let node = element.parentElement.parentElement;
      editComment(buttonID[1], userAccess);
    });
  });
}

async function editComment($id, userAccess) {
  let newLink = commentLink + '?id=' + $id;
  let response = await fetch(newLink, {
    method: 'GET',
    headers: {
      'status': 'get-comment',
    }
  });
  response = await response.json();
  response = response.comment;
  let modal = document.getElementById("modal-window");
  modal.innerHTML = `
  <div class="modal-content">
    <span class="close">&times;</span>
  </div>
  `

  let span = document.getElementsByClassName("close")[0];
  modal.classList.add('active');

  span.onclick = function () {
    modal.classList.remove('active');
    document.body.style.position = 'relative';
  }

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.classList.remove('active');
      document.body.style.position = 'relative';
    }
  }

  let form = createForm();
  const modalContent = document.querySelector('.modal-content');
  const prevEdit = modalContent.querySelector('.user-information__edit');

  if (prevEdit !== null) {
    modalContent.removeChild(prevEdit);
  }

  modalContent.appendChild(form);
  let userImage = document.getElementById('user-img');
  let userName = document.getElementById('username');
  let userEmail = document.getElementById('useremail');
  let articleImage = document.getElementById('article-img');
  let articleName = document.getElementById('articleName');
  let articleCreated = document.getElementById('articleCreatedAt');
  let createdAt = document.getElementById('created-at');
  let commentText = document.getElementById('comment');
  document.body.style.position = 'fixed';
  if (response.user.user_image !== 'empty') {
    userImage.src = imageLink + response.user.user_image;
  }
  else {
    userImage.src = '../dest/images/default-background.webp';
  }
  userName.textContent = response.user.login;
  userEmail.textContent = response.user.email;
  createdAt.value = response.created_at;
  response.article.logo === 'empty'
    ? articleImage.src = '../dest/images/default-background.webp'
    : articleImage.src = QUERY_LINK + 'articles/images/' + response.article.logo;
  articleName.textContent = response.article.name;
  articleCreated.textContent = response.article.created_at;
  commentText.value = response.text;

  let saveButton = document.getElementById('save-change');
  saveButton.addEventListener('click', async e => {
    e.preventDefault();
    if (commentText.value === '') {
      return;
    }
    await updateComment(response.id, commentText.value);
    modal.classList.remove('active');
    document.body.style.position = 'relative';
    await refresh('comments');
  });


  let cancelButton = document.getElementById('cancel-button');
  cancelButton.addEventListener('click', e => {
    e.preventDefault();
    modal.classList.remove('active');
    document.body.style.position = 'relative';
  });
}

function createForm() {
  let container = document.createElement('div');
  container.classList.add('user-information__edit');
  let userInfo = `
  <h3 class="user-info-header">Автор</h3>
  <div class="user-info">
    <div class="user-image">
      <img id="user-img" src="../dest/images/background-image.png" alt="">
    </div>
    <span class='user-info-item login' id="username"></span>
    <span class='user-info-item email' id="useremail"></span>
  </div>
  `;
  let articleInfo = `
  <h3 class="user-info-header">Пост</h3>
  <div class="user-info">
    <div class="user-image">
      <img id="article-img" src="../dest/images/background-image.png" alt="">
    </div>
    <span class='user-info-item login' id="articleName"></span>
    <span class='user-info-item email' id="articleCreatedAt"></span>
  </div>
  `;
  let form = `
  <h3 class="user-info-header">Коментар</h3>
  <form class="user-information__form edit-form">
    <label class="edit-lable" for="comment">Коментар</label>
    <textarea class="comment__input edit-input" id="comment" type="text"></textarea>
    <label class="edit-lable" for="created-at">Дата створення</label>
    <input class="user-informaion__input  edit-input" id="created-at" type="text" disabled>
    <div class="edit-error-field">
      <ul class="error-list">
      </ul>
    </div>
    <div class="edit-action-buttons">
      <input class="edit-action-button" id="save-change" type="submit" value="Зберегти">
      <button class="edit-action-button" id="cancel-button">Назад</button>
    </div>
  </form>
`
  container.innerHTML = userInfo;
  container.innerHTML += articleInfo;
  container.innerHTML += form;
  return container;
}

async function updateComment(commentID, data) {
  let response = await fetch(commentLink, {
    method: 'PATCH',
    headers: {
      'status': 'update-comment',
    },
    body: JSON.stringify({ data, commentID }),
  });
  return await response.json();
}
export default addItemsHandler;
