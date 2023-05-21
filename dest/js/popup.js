import { QUERY_LINK } from "./backlink.js";
const userImageLink = QUERY_LINK + 'UserImages/';
const portfolioLink = QUERY_LINK + 'arts';
const userLink = QUERY_LINK + 'users';
const body = document.querySelector('body');
const wrapper = document.querySelectorAll('.wrapper');
const lockPadding = document.querySelectorAll('.lock-padding');
let unlock = true;
const timeout = 300;

export async function outPopup(popupID, currentPopup, userID) {
  await popupSetInforamation(currentPopup, popupID, userID);
  popupOpen(currentPopup);
  const popupCloseIcon = currentPopup.querySelector('.close-popup');
  addCloseEvent(popupCloseIcon);
}



function popupOpen(currentPopup) {
  if (currentPopup && unlock) {
    const popupActive = document.querySelector('.popup.open');
    if (popupActive) {
      popupClose(popupActive, false);
    }
    else {
      bodyLock();
    }

    currentPopup.classList.add('open');
    currentPopup.addEventListener("click", (e) => {
      if (!e.target.closest('.popup__content')) {
        popupClose(e.target.closest('.popup'));
      }
    });
  }
}

function popupClose(popupActive, doUnlock = true) {
  if (unlock) {
    popupActive.classList.remove('open');
    if (doUnlock) {
      bodyUnlock();
    }
  }
}


function bodyLock() {
  const lockPaddingValue = '100%';
  if (lockPadding.length > 0) {
    lockPadding.forEach(item => {
      item.style.paddingRight = lockPaddingValue;
      item.style.opacity = 0;
    });
  }
  wrapper.forEach(element => {
    element.style.opacity = '0';
  });
  body.style.overflowY = 'hidden';
  body.classList.add('lock');
  body.style.paddingRight = '17px';
  unlock = true;
}

function bodyUnlock() {
  lockPadding.forEach(element => {
    element.style.paddingRight = '0px';
    element.style.opacity = 1;
  });
  wrapper.forEach(element => {
    element.style.opacity = '1';
  });
  body.style.overflowY = 'auto';;
  body.style.paddingRight = '0px';
  body.classList.remove('lock');
}

function addCloseEvent(popupCloseIcon) {
  popupCloseIcon.addEventListener('click', (e) => {
    e.preventDefault();
    popupClose(popupCloseIcon.closest('.popup'));
  });
}


//popup вивід інформації

async function popupSetInforamation(currentPopup, itemID, userID) {

  let popupInfo = await getInfoForPopup(itemID);
  currentPopup.innerHTML = `
  <div class="popup__body">
    <a href="##" class="popup__area"></a>
    <div class="popup__content">
    <div class="popup__portfolio">
      <a href="" class="popup__close close-popup">&times;</a>
      <div class="popup__title"></div>
      <img class="popup__image" src="" alt="main-img">
      <div class="popup__text"></div>
    </div>
    <h3 class="popup__title user-title">Автор</h3>
    <div class="popup__user">
      <div class="user__image">
        <img class="user-img" src="../dest/images/default-background.webp" alt="user-image"/>
      </div>
      <span class="user-field user-name"></span>
      <span class="user-field user-email"></span>
    </div>
    <div class="likes">
      <span class="like-count"></span>
      <button class="like-button"><img class="like-img" src="../dest/images/like.png"/></button>
    </div>
  </div>
  </div>
  `;
  const popupContent = document.querySelector('.popup__portfolio');
  const popupImage = document.querySelector('.popup__image');
  popupInfo.portfolio_logo === 'empty'
    ? popupImage.src = '../dest/images/default-background.webp'
    : popupImage.src = QUERY_LINK + 'portfolio/logo/' + popupInfo.portfolio_logo;
  await formattedImages(popupContent, popupImage);
  popupInfo.images.forEach(async image => {
    let imageItem = document.createElement('img');
    imageItem.classList.add('popup__image');
    imageItem.src = QUERY_LINK + 'portfolio/images/' + image.image_name;
    popupContent.appendChild(imageItem);
    await formattedImages(popupContent, imageItem);
  });
  if (popupInfo.user.user_image != 'empty') {
    const userImage = document.querySelector('.user-img');
    userImage.src = userImageLink + popupInfo.user.user_image;
  }
  const userName = document.querySelector('.user-name');
  userName.textContent = popupInfo.user.login;
  const userEmail = document.querySelector('.user-email');
  userEmail.textContent = popupInfo.user.email;

  const likes = document.querySelector('.like-count');
  likes.textContent = popupInfo.likes;
  const likeButton = document.querySelector('.like-button');
  likeButton.addEventListener('click', async e => {
    e.preventDefault();
    if (userID !== undefined) {
      let newLink = portfolioLink + '?id=' + popupInfo.id + '&uid=' + userID;
      let response = await fetch(newLink, {
        method: 'PATCH',
        headers: {
          'status': 'set-like'
        }
      })
      response = await response.json();
      likes.textContent = response.likes;
    }
  });
  setPopupInfo(popupInfo, popupContent);
}

async function getInfoForPopup(itemID) {
  let newLink = portfolioLink + '?id=' + itemID;
  let response = await fetch(newLink, {
    method: 'GET',
    headers: {
      "Content-type": "application/json;",
      "status": "get-info"
    },
  })
  return await response.json();
}

async function setPopupInfo(data, popup) {
  const popupHeader = popup.querySelector('.popup__title');
  const popupText = popup.querySelector('.popup__text');
  popupHeader.innerText = data['name'];
  popupText.innerText = data['description'];
}

async function popupLoadLogo(itemID) {
  let newLink = portfolioLink + '?id=' + itemID;
  let response = await fetch(newLink, {
    method: 'GET',
    headers: {
      "status": "get-image"
    },
  })

  let responseHeaders = response.headers;
  let responseMethod = 'blob';
  responseHeaders.forEach(element => {
    if (element === 'json/application') {
      responseMethod = 'json';
    }
  });
  if (responseMethod === 'json') {
    return await response.json();
  }
  else {
    return await response.blob();
  }

}

async function popupLoadImages(itemID, index) {
  let newLink = portfolioLink + '?id=' + itemID + '&offset=' + index;
  let response = await fetch(newLink, {
    method: 'GET',
    headers: {
      "status": "get-image-for-portfolio"
    },
  });
  return await response.blob();
}

async function formattedImages(popupContent, popupItem) {
  let itemWidth = parseInt(getComputedStyle(popupItem).width);
  setTimeout(() => {
    itemWidth = parseInt(getComputedStyle(popupItem).width);
  }, 100);
  let containerWidth = parseInt(getComputedStyle(popupContent).width);
  if (itemWidth < containerWidth - 200) {
    popupItem.style.width = (containerWidth - 200) + 'px';
  }
  else {
    popupItem.style.width = (containerWidth + 1) + 'px';
  }
}
