import { DEFAULT_IMAGE, QUERY_LINK } from '../backlink.js';

const articlesLink = QUERY_LINK + 'admin/articles';
const userImageLink = QUERY_LINK + 'UserImages/';
const articleImagesLink = QUERY_LINK + 'articles/images/';
let { refresh } = await import('./loadItems.js');
let fileList = [];
async function addItemsHandler(userTemplate, userAccess) {
  const deleteButtons = userTemplate.querySelectorAll('.article-delete-button');
  const editeButtons = userTemplate.querySelectorAll('.article-edit-button');
  const statusButtons = userTemplate.querySelectorAll('.status-button');
  addDeleteHandler(deleteButtons);
  addEditHandler(editeButtons, userAccess);
  await addStatusHandler(statusButtons);

}


function addDeleteHandler(buttons) {
  buttons.forEach(element => {
    element.addEventListener('click', async e => {
      e.preventDefault();
      let buttonID = element.id.split('-');
      if (confirm("Ви точно хочете видалити даний пост?")) {
        if (await deleteArticle(buttonID[1])) {
          await refresh('articles');
        }
      }
    });
  });
}

async function deleteArticle(id) {
  let newLink = articlesLink + '?id=' + id;
  let response = await fetch(newLink, {
    method: 'DELETE',
    headers: {
      'status': 'delete-article',
    }
  });
  response = await response.json();
  return response;
}

function addEditHandler(buttons, userAccess) {
  buttons.forEach(element => {
    element.addEventListener('click', async e => {
      e.preventDefault();
      let buttonID = element.id.split('-');
      let node = element.parentElement.parentElement;
      let article = await getArticle(buttonID[1]);
      editArticle(article);
    });
  });
}
async function getArticle(id) {
  let newLink = articlesLink + '?id=' + id;
  let response = await fetch(newLink, {
    method: 'GET',
    headers: {
      'status': 'get-article',
    }
  });
  return await response.json();
}

async function editArticle(article) {
  let user = article.user;
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
      console.log('12313');
    }
  }
  let id = makeid(5)
  let form = createForm(id);

  const modalContent = document.querySelector('.modal-content');
  const prevEdit = modalContent.querySelector('.article-information__edit');

  if (prevEdit !== null) {
    modalContent.innerHTML = "";
  }
  modalContent.appendChild(form);

  document.body.style.position = 'fixed';

  let userImage = document.getElementById('user-img');
  let userName = document.getElementById('username');
  let userEmail = document.getElementById('useremail');
  let userRole = document.getElementById('userrole');
  let textArea = document.querySelector('.edit-article__area');
  userName.textContent = user.login;
  userEmail.textContent = user.email;
  if (user.image === 'empty') {
    userImage.src = '..' + DEFAULT_IMAGE;
  }
  else {
    userImage.src = userImageLink + user.image;
  }
  if (user.is_admin == 1) {
    userRole.textContent = 'Адмін';
  }
  else if (user.is_admin == 2) {
    userRole.textContent = 'Суперадмін';
  }
  else {
    userRole.textContent = 'Гість';
  }
  console.log(textArea.id);
  await init("#" + textArea.id);
  const articleName = document.getElementById('article-name');
  articleName.value = article.name;
  tinymce.get(id).setContent(article.text);
  let images = tinymce.get(id).dom.select('img');
  images.forEach(element => {
    let split = element.src.split('/');
    element.src = articleImagesLink + split[split.length - 1];
    //element.alt = split[split.length - 1];
  });
  let saveButton = document.getElementById('save-change');
  saveButton.addEventListener('click', async e => {
    e.preventDefault();
    let saveMessage = await save(id, article.id);
    if (saveMessage) {

      modal.classList.remove('active');
      document.body.style.position = 'relative';
    }
    console.log(saveMessage);
  });

  let cancelButton = document.getElementById('cancel-button');
  cancelButton.addEventListener('click', e => {
    e.preventDefault();
    modal.classList.remove('active');
    document.body.style.position = 'relative';
  });
}
async function save(id, articleID) {
  let textData;
  let areaText = tinymce.get(id).getContent({ format: 'text' });
  areaText.length > 450
    ? textData = areaText.slice(0, 450) + '...'
    : textData = areaText;
  let headerText = document.querySelector('.article__name');
  if (textData.length < 20) {
    return outError('Дуже мале наповнення поста заповніть більше');
  }
  if (headerText.value.length < 5) {
    return outError('Заголовок повинен складатися як мінімум з 5 символів');
  }
  let data = tinymce.get(id).getBody();
  let images = data.querySelectorAll('img');
  let newFileList = [];
  let oldImages = [];
  images.forEach(image => {
    if (image.src.includes(QUERY_LINK)) {
      oldImages.push(image.alt);
      return;
    }
    fileList.forEach(file => {
      if (image.alt === file.newName) {
        image.src = file.newName;
        newFileList.push(file);
      }
    });
  });
  let sendData = tinymce.get(id).getContent();
  await sendArticle(sendData, newFileList, headerText.value, textData, oldImages, articleID);
  return true;
}
async function sendArticle(article, files, head, desc, oldImages, id) {
  console.log('13378sfjfhdgbn,fgb, fdb g, ');
  const formData = new FormData();
  let imagesInfo = {};
  if (Object.keys(files).length !== 0) {
    for (const key in files) {
      formData.append(key, files[key]['file']);
      imagesInfo[key] = { oldName: files[key]['oldName'], newName: files[key]['newName'] };
    }
  }
  formData.append('imagesInfo', JSON.stringify(imagesInfo));
  formData.append('id', id);
  formData.append('article', article);
  formData.append('header', head);
  formData.append('desc', desc);
  formData.append('oldImages', JSON.stringify(oldImages));
  let articleLink = QUERY_LINK + 'add-article';
  fetch(articleLink, {
    method: 'POST',
    headers: {
      'Status': 'update-article',
    },
    body: formData
  })
    .then(res => res.json())
    .then(res => {
      if (res.status) {
        let modal = document.getElementById("modal-window");
        modal.classList.remove('active');
        document.body.style.position = 'relative';
        refresh('articles');
      }
    });
}

function createForm(id) {
  let container = document.createElement('div');
  container.classList.add('article-information__edit');
  let userInfo = `
  <h3 class="user-info-header">Автор</h3>
  <div class="user-info">
    <div class="user-image">
      <img id="user-img" src="../dest/images/background-image.png" alt="">
    </div>
    <span class='user-info-item login' id="username"></span>
    <span class='user-info-item email' id="useremail"></span>
    <span class='user-info-item status' id="userrole"></span>
  </div>
  `
  let form = `
  <h3 class="user-info-header">Пост</h3>
  <form class="article-information__form edit-form">
    <label for="article-name" class="edit-lable">Назва</label>
    <input class="article__name edit-input" id="article-name" name="article-name" type="text" placeholder="Назва поста">
    <textarea class="edit-article__area" id="${id}">
    </textarea >
    <div class="edit-error-field">
      <ul class="error-list">
      </ul>
    </div>
    <div class="edit-action-buttons">
      <input class="edit-action-button" id="save-change" type="submit" value="Зберегти">
      <button class="edit-action-button" id="cancel-button">Назад</button>
    </div>
  </form >
    `
  container.innerHTML = userInfo;
  container.innerHTML += form;
  return container;
}

function makeid(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}
async function init(id) {
  let init = await tinymce.init({
    selector: id,
    toolbar: 'undo redo | blocks fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
    plugins: 'image',
    images_file_types: 'jpg,svg,webp,png',
    file_picker_types: 'file image media',
    tinycomments_mode: 'embedded',
    file_picker_types: 'image',
    paste_block_drop: true,
    paste_as_text: true,
    file_picker_callback: (cb, value, meta) => {
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', 'image/*');
      let currentTime = new Date().getTime();
      input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        fileList.push({ oldName: file.name, newName: currentTime + '' + file.name, file });
        const reader = new FileReader();
        reader.addEventListener('load', () => {

          const id = 'blobid' + (new Date()).getTime();
          const blobCache = tinymce.activeEditor.editorUpload.blobCache;
          const base64 = reader.result.split(',')[1];
          const blobInfo = blobCache.create(id, file, base64);
          blobCache.add(blobInfo);
          cb(blobInfo.blobUri(), { alt: currentTime + '' + file.name, title: file.name });
        });
        reader.readAsDataURL(file);
      });
      input.click();
    },
    mergetags_list: [
      { value: 'First.Name', title: 'First Name' },
      { value: 'Email', title: 'Email' },
    ]
  });
}

function outError(error) {
  const errorField = document.querySelector('.error-list');
  errorField.innerHTML = '';
  let errorItem = document.createElement('li');
  errorItem.classList.add('error-item');
  errorItem.textContent = error;
  errorField.appendChild(errorItem);
}

async function addStatusHandler(buttons) {
  buttons.forEach(button => {
    button.addEventListener('click', async e => {
      e.preventDefault();
      const id = button.id.split('-');
      let response = await fetch(articlesLink, {
        method: 'PATCH',
        headers: {
          'status': 'update-status'
        },
        body: JSON.stringify({
          'articleID': id[0],
          'status': id[1],
        })
      });
      response = await response.json();
      if (response.status) {
        alert(response.message);
        await refresh('articles');
      }
    });
  });
}

export default addItemsHandler;
