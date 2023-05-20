import { QUERY_LINK } from "./backlink.js";
import { getUser } from "./checkUser.js";
const userLink = QUERY_LINK + 'users';
const userToken = sessionStorage.getItem('user_token') || localStorage.getItem('user_token') || 0;
let user;
let fileList = [];
init();
tinymce.init({
  selector: '#add-area',
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

async function getCategories() {
  let response = await fetch(QUERY_LINK + 'categories', {
    method: 'GET',
    headers: {
      'status': 'get-all-categories-without-posts'
    }
  });
  response = response.json();
  return response;
}

const saveButton = document.querySelector('.save-button');
saveButton.addEventListener('click', async e => {
  e.preventDefault();
  let textData;
  let areaText = tinymce.get('add-area').getContent({ format: 'text' });
  areaText.length > 450
    ? textData = areaText.slice(0, 450) + '...'
    : textData = areaText;
  let headerText = document.querySelector('.article__header');
  const erorrField = document.querySelector('.error');
  if (textData.length < 20) {
    return outError('Дуже мале наповнення поста заповніть більше', erorrField)
  }
  if (headerText.value.length < 5) {
    return outError('Заголовок повинен складатися як мінімум з 5 символів', erorrField);
  }
  if (headerText.value.length > 500) {
    return outError('Заголовок повинен складатися максимум з 500 символів', erorrField);
  }
  let data = tinymce.get('add-area').getBody();
  let images = data.querySelectorAll('img');
  let newFileList = [];
  images.forEach(image => {
    fileList.forEach(file => {
      if (image.alt === file.newName) {
        image.src = file.newName;
        newFileList.push(file);
      }
    });
  });
  let sendData = tinymce.get('add-area').getContent();
  const categoriesID = document.querySelector('.article__category-select').value;
  await sendArticle(sendData, newFileList, headerText.value, textData, categoriesID);
});
const cancelButton = document.querySelector('.back-button');
cancelButton.addEventListener('click', e => {
  e.preventDefault();
  location = '../';
});
function outError(error, field) {
  field.textContent = error;
}

async function sendArticle(article, files, head, desc, categoriesID) {
  const formData = new FormData();
  let imagesInfo = {};
  if (Object.keys(files).length !== 0) {
    for (const key in files) {
      console.log(files[key]['file'], 'key');
      formData.append(key, files[key]['file']);
      imagesInfo[key] = { oldName: files[key]['oldName'], newName: files[key]['newName'] };
    }
  }
  formData.append('imagesInfo', JSON.stringify(imagesInfo));
  formData.append('article', article);
  formData.append('header', head);
  formData.append('desc', desc);
  formData.append('userID', user.id);
  formData.append('categoriesID', categoriesID);
  let articleLink = QUERY_LINK + 'add-article';
  fetch(articleLink, {
    method: 'POST',
    headers: {
      'Status': 'add-article',
    },
    body: formData
  })
    .then(res => res.json())
    .then(res => {
      if (res.res.articles.ok) {
        location = '../';
      }
    });
}

async function init() {
  if (userToken === 0) {
    location = '../';
  }
  user = await getUser(userToken);
  if (user.error) {
    location = '../';
  }
  const categories = await getCategories();
  setCategories(categories);
}

function setCategories(categories) {
  let categorieList = document.querySelector('.article__category-select');
  categorieList.innerHTML = '';
  categories.forEach(category => {
    let categoriesItem = document.createElement('option');
    categoriesItem.classList.add('categories__item');
    categoriesItem.textContent = category.name;
    categoriesItem.value = category.id;
    categorieList.appendChild(categoriesItem);
  });
}



