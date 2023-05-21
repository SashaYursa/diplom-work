import { QUERY_LINK } from '../backlink.js';

let { loadItems } = await import('./loadItems.js');
//Перевірка на те, що користувач дійсно адмін
let user;
const urlParams = new URLSearchParams(window.location.search);
let myParam = urlParams.get('page') || 1;
const ItemsInPage = 15;
let itemsCount = ItemsInPage * (myParam - 1);
let offset = itemsCount * ItemsInPage;

let pageCount;
let itemCount;

let page;

const link = QUERY_LINK + 'users';
const adminLink = QUERY_LINK + 'admin/';
const userToken = sessionStorage.getItem('user_token') || localStorage.getItem('user_token') || 0;
if (userToken !== 0) {
  checkUser();
}
else {
  location = "/";
}

async function checkUser() {

  user = await getUser(link, userToken);
  if (user.is_admin != '0') {
    return;
  }
  location = "/";
}

async function getUser(link, token) {
  let newlink = link + '?token=' + token;
  let response = await fetch(newlink);
  return response.json();
}


const settingsButton = document.querySelector('#control');
const sideBarList = document.querySelector('.sidebar__list');
settingsButton.addEventListener('click', e => {
  e.preventDefault();
  if (user.is_admin == 0) {
    location = '/';
    return;
  }
  sideBarList.classList.toggle('active');
});
const categoriesTemplate = `
<div class="categories__add">
  <h1 class="categories__header">Додати категорію</h1>
  <form class="categories__form">
    <label class="category__label" for="categoryName">Назва категорії</label>
    <br>
    <div class="input__block">
      <input class="category__input" id="categoryName" name="name" type="text">
      <input type="submit" class="category__save" value="Зберегти">
    </div>
  </form>
  <h1 class="categories__header">Всі категорії</h1>
</div>
<div class="categories__list">
</div>
`
const settingsItems = document.querySelectorAll('.sidebar__button');
const categoriesButton = document.querySelector('#categories');
categoriesButton.addEventListener('click', async e => {
  e.preventDefault();
  if (categoriesButton.classList.contains('active')) {
    return;
  }
  categoriesButton.classList.add('active');
  settingsItems.forEach(item => {
    item.classList.remove('active');
  });
  document.querySelector('.content__items').innerHTML = categoriesTemplate;
  document.querySelector('.pagination').innerHTML = '';
  const categoriesLink = QUERY_LINK + 'categories';
  addEventAddcategory(categoriesLink);
  await updateCategories(categoriesLink);
});

async function updateCategories(categoriesLink) {
  const categories = await getCategories(categoriesLink);
  const categoriesNode = await setCategories(categories);
  addEventsCategories(categoriesNode, categoriesLink);
}

async function addEventAddcategory(categoriesLink) {
  const addCategoryForm = document.querySelector('.categories__form');
  addCategoryForm.querySelector('.category__save')
    .addEventListener('click', async e => {
      e.preventDefault();
      const categoryName = addCategoryForm.querySelector('.category__input');
      if (categoryName.value.length < 3) {
        categoryName.value = '';
        return categoryName.placeholder = 'Має бути більше 2 символів';
      }
      let add = await addCategory(categoryName.value, categoriesLink);
      console.log(add);
      !add ? categoryName.placeholder = 'Помилка' : categoryName.placeholder = '';
      categoryName.value = '';
      await updateCategories(categoriesLink);
    });
}
async function addCategory(name, link) {
  const formData = new FormData();
  formData.append('name', name);
  let response = await fetch(link, {
    method: 'POST',
    body: formData
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

async function setCategories(categories) {
  const categoriesList = document.querySelector('.categories__list');
  categoriesList.innerHTML = '';
  const template = `
    <span class="category__name"></span>
    <span class="category__count"></span>
    <div class="category__action">
      <button class="category__delete" id="">Видалити</button>
      <button class="category__edit" id="">Редагувати</button>
    </div>
    <form action="" class="category__edit-form">
      <div class="input__block">
        <input class="category__input" id="categoryName" name="name" type="text">
        <input type="submit" class="category__save" value="Зберегти">
      </div>
    </form>
  `
  categories.forEach(category => {
    const categoryElement = document.createElement('div');
    categoryElement.classList.add('category');
    categoryElement.id = "category-" + category.id;
    categoryElement.innerHTML = template;
    const deleteButton = categoryElement.querySelector('.category__delete');
    const editButton = categoryElement.querySelector('.category__edit');
    const categoryInput = categoryElement.querySelector('.category__input');
    const categoryName = categoryElement.querySelector('.category__name');
    const categoryCount = categoryElement.querySelector('.category__count');
    const categorySaveButton = categoryElement.querySelector('.category__save');
    deleteButton.id = category.id;
    editButton.id = category.id;
    categoryInput.value = category.name;
    categoryName.textContent = category.name;
    categoryCount.textContent = 'Постів: ' + category.posts.count;
    categorySaveButton.id = category.id;
    categoriesList.appendChild(categoryElement);
  });
  return categoriesList;
}

async function addEventsCategories(node, link) {
  const categoryDeleteButtons = node.querySelectorAll('.category__delete');
  categoryDeleteButtons.forEach(button => {
    button.addEventListener('click', async e => {
      e.preventDefault();
      if (!confirm('При видаленні будуть видалені всі пости які містять цю категорію. Ви точно хочете видалити дану категорію?')) {
        return;
      }
      let response = await fetch(link + '?id=' + button.id, {
        method: 'DELETE'
      });
      response = await response.json();
      if (response) {
        node.querySelector('#category-' + button.id).remove();
      }
    })
  });
  const categoryEditButtons = node.querySelectorAll('.category__edit');
  categoryEditButtons.forEach(button => {
    button.addEventListener('click', async e => {
      e.preventDefault();
      const categoryItem = document.getElementById('category-' + button.id);
      categoryItem.classList.add('edit');
    });
  });
  const saveCategoryEdit = node.querySelectorAll('.category__save');
  saveCategoryEdit.forEach(button => {
    button.addEventListener('click', async e => {
      e.preventDefault();
      const newName = button.parentElement.querySelector('.category__input');
      if (newName.value.length < 3) {
        newName.value = '';
        return newName.placeholder = 'Має бути більше 2 символів';
      }
      const data = { id: button.id, name: newName.value };
      const response = await fetch(link, {
        method: 'PATCH',
        body: JSON.stringify(data)
      })
        .then(res => res.json());
      if (response) {
        const categoryItem = document.getElementById('category-' + button.id);
        categoryItem.classList.remove('edit');
        const categoryName = button.parentElement.parentElement.parentElement.querySelector('.category__name');
        categoryName.textContent = newName.value;
      }
    });
  });
}

settingsItems.forEach(element => {
  element.addEventListener('click', async e => {
    e.preventDefault();
    offset = 0;
    categoriesButton.classList.remove('active');
    if (element.classList[1] !== 'active') {
      settingsItems.forEach(item => {
        if (item.classList[1] === 'active') {
          item.classList.remove('active');
        }
      });
      page = element.id;
      await loadItems(page, ItemsInPage, offset, user.is_admin);
      element.classList.add('active');
      await getCountPages(ItemsInPage, page);
      await displayPagination();
    }
  })
});

// Пагінація
function clearActivePagination() {
  let paginationItems = document.querySelectorAll('.pagination__item');
  paginationItems.forEach(element => {
    element.classList.remove('active');
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
    clearActivePagination();
    startElement.classList.add('active');
    e.preventDefault();
    await loadItems(page, ItemsInPage, 0, user.is_admin);
    window.scrollTo(0, 0)
  });
  for (let i = 0; i < pageCount; i++) {
    let paginationItem = createPaginationItem(i + 1);
    paginationElement.appendChild(paginationItem);

    paginationItem.addEventListener('click', async (e) => {
      e.preventDefault();
      clearActivePagination();
      paginationItem.classList.add('active');
      myParam = paginationItem.innerText;
      offset = (myParam - 1) * ItemsInPage;
      await loadItems(page, ItemsInPage, offset, user.is_admin);
      window.scrollTo(0, 0);
    });
  }
  const endElement = document.createElement("a");
  endElement.classList.add('pagination__item');
  endElement.innerText = '»';
  paginationElement.appendChild(endElement);
  endElement.addEventListener('click', async (e) => {
    e.preventDefault();
    clearActivePagination();
    endElement.classList.add('active');
    myParam = pageCount;
    itemsCount = ItemsInPage * (myParam - 1);
    offset = ItemsInPage * (pageCount - 1);
    await loadItems(page, ItemsInPage, offset, user.is_admin);
    window.scrollTo(0, 0)
  });
}

function createPaginationItem(page) {
  const paginationElement = document.createElement("a");
  paginationElement.classList.add('pagination__item');
  paginationElement.innerText = page;
  if (paginationElement.innerText == myParam) {
    paginationElement.classList.add('active');
  }
  return paginationElement;
}

async function getCountPages(items, page) {
  let newLink = adminLink + page + '?itemsInPage=' + items;
  let response = await fetch(newLink, {
    method: 'GET',
    headers: {
      'status': 'get-count-pages',
    }
  })
  response = await response.json();
  pageCount = response.pages;
  itemCount = response.items;
}
