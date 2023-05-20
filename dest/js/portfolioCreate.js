import { QUERY_LINK } from "./backlink.js";
import { getUser } from "./checkUser.js";
const userToken = sessionStorage.getItem('user_token') || localStorage.getItem('user_token') || 0;
const portfolioLink = QUERY_LINK + 'arts';
const send = document.querySelector('.work__submit');
const form = document.querySelector('work__form');
let fileList = [];
let user;
async function main() {
  user = await getUser(userToken);
  if (user.error) {
    location = '../../404/';
  }
}
main();



const backbutton = document.querySelector('.back-button');
backbutton.addEventListener('click', e => {
  e.preventDefault();
  location = '../';
});
send.addEventListener('click', e => {
  e.preventDefault();
  if (userToken === 0) {
    window.location.href = '/404/';
  }
  const name = document.querySelector('.work__name').value;
  const description = document.querySelector('.work__description').value;
  console.log(description.length);
  if (name.length < 5) {
    return outError('Назва має складатися як мінімум з 5 символів');
  }
  if (name.length > 300) {
    return outError('Максимальна кількість символів в назві 300, зараз: ' + name.length);
  }
  if (description.length < 5) {
    return outError('Опис роботи має складатися як мінімум з 5 символів');
  }
  if (description.length > 2000) {
    return outError('Максимальна кількість символів в описі 2000, зараз: ' + description.length);
  }
  if (fileList.length === 0) {
    return outError('Потрібно додати хоч 1 фотографію');
  }
  const formData = new FormData();
  formData.append('userToken', userToken);
  formData.append('name', name);
  formData.append('description', description);
  formData.append('logo', fileList[0]);
  fetch(portfolioLink, {
    method: 'POST',
    headers: {
      'status': 'create-portfolio',
    },
    body: formData
  }).then(response => response.json())
    .then(data => {
      fileList.shift();
      if (data['status']) {
        fileList.forEach(element => {
          pushImages(data['id'], element);
        });
        window.location.href = '/user';
      } else {
        outError('Помилка при додаванні');
      }
    });
});

function pushImages(id, image) {
  const formData = new FormData();
  formData.append('id', id);
  formData.append('image', image);
  fetch(portfolioLink, {
    method: 'POST',
    headers: {
      'status': 'add-image-for-portfolio',
    },
    body: formData
  }).then(response => response.json())
    .then(data => {
      if (!data.status) {
        return outError(data.message);
      }
    });
}

const dragAndDrop = document.getElementById('dropZone');

dragAndDrop.addEventListener('dragenter', e => {
  e.preventDefault();
  dragAndDrop.classList.add('active');
});

dragAndDrop.addEventListener("dragleave", e => {
  e.preventDefault();
  dragAndDrop.classList.remove('active');
});

dragAndDrop.addEventListener('drop', (e) => {
  e.preventDefault();
  let file = e.dataTransfer.files[0];
  fileHandler(file);
});

dragAndDrop.addEventListener('dragover', (e) => { e.preventDefault() }, false);

const file = document.querySelector('.file__button');

dragAndDrop.addEventListener('click', (e) => {
  e.preventDefault();
  dragAndDrop.classList.add('active');
  file.click();
});

file.addEventListener('change', (e) => {
  e.preventDefault();
  fileHandler(file.files[0]);
});

function fileHandler(file) {
  dragAndDrop.classList.remove('active');

  if (file != null || file != undefined) {
    let size = file.size / 1024 / 1024;
    if (size > 5) {
      return outError('Максимальний розмір файлу 5мб');
    }
    let status = true;
    fileList.forEach(element => {
      if (element.name === file.name) {
        status = false;
      }
    });
    if (!status) {
      return outError('Таку картинку вже завантажено');
    }
    if (!file.name.match(/\.(jpg|jpeg|png|gif|jfif|svg|webp)$/i)) {
      return outError('Можна додавати тільки картинки');

    }
    const imageField = document.querySelector('.image__field');
    let imgContainer = document.createElement('div');
    let imgElement = document.createElement('img');
    let imgRemove = document.createElement('button');

    imgContainer.classList.add('image-container');
    imgElement.classList.add('selected-image');
    imgRemove.classList.add('delete-image');
    imgRemove.id = file.name;
    let url = URL.createObjectURL(file);
    imgElement.src = url;
    imgContainer.appendChild(imgElement);
    imgContainer.appendChild(imgRemove);
    imageField.appendChild(imgContainer);

    imageField.classList.add('active');

    fileList.push(file);
    createRemoveEvent(imgRemove);
  }
}

function createRemoveEvent(removeElement) {

  removeElement.addEventListener('click', e => {
    e.preventDefault();
    let temp = [];
    fileList.forEach(el => {
      if (el.name !== removeElement.id) {
        temp.push(el);
      }
    });
    fileList = temp;
    console.log(fileList);
    removeElement.parentElement.remove();
  });
}

function outError(error) {
  let errorList = document.querySelector('.work__image-error');
  errorList.innerHTML = '';
  let errorNode = document.createElement('li');
  errorNode.classList.add('error-text');
  errorNode.textContent = error;
  errorList.appendChild(errorNode);
}
