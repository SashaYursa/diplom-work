import { QUERY_LINK } from '../backlink.js';
export const header = `
<div class="header-inner">
  <div class="container">
    <div class="header__menu">
      <div class="logo-wrapper">
        <a class="menu__logo" href="/">Блог</a>
      </div>
      <div class="header__menu-items">
        <nav class="menu__nav">
          <ul class="menu__items">
            <li class="menu__item">
              <a class="menu__link" href="/">Головна</a>
            </li>
            <li class="menu__item">
              <a class="menu__link" href="/portfolio/">Роботи</a>
            </li>
            <li class="menu__item">
              <a class="menu__link" href="/articles/">Пости</a>
            </li>
            <li class="menu__item">
              <a class="menu__link" href="/about/">Про нас</a>
            </li>
          </ul>
        </nav>
        <div class="vertical-line items"></div>
        <div class="menu__socials">
          <ul class="social__items">
            <li class="social__item">
              <a class="social-link header__social-link" id="facebook" href="#">
                <img class="social__image" src="../dest/images/facebook-light.png" alt="social">
              </a>
            </li>
            <li class="social__item">
              <a class="social-link header__social-link" id="instagram" href="#">
                <img class="social__image" src="../dest/images/insta-light.png" alt="social">
              </a>
            </li>
            <li class="social__item">
              <a class="social-link header__social-link" id="twitter" href="#">
                <img class="social__image" src="../dest/images/twitter-light.png" alt="social">
              </a>
            </li>
          </ul>
        </div>
        <div class="vertical-line social"></div>
        <div class="menu__search-bar">
          <form class="menu__search-form">
            <input class="menu__search-input" type="search" required>
            <button class="menu__search-submit" type="submit" value=" "></button>
          </form>
        </div>
        <div class="vertical-line user"></div>
        <a class="menu__login-button menu__link" id="login" href="../login/">Увійти</a>
      </div>
      <div class="header__burger">
        <span></span>
      </div>
    </div>
  </div>
</div>
`

async function setLinks() {
  await fetch(QUERY_LINK + 'links', {
    method: 'GET'
  })
    .then(response => response.json())
    .then(links => {
      links.forEach(link => {
        document.querySelectorAll('.header__social-link').forEach(headerLink => {
          if (headerLink.id === link.name) {
            headerLink.href = link.link;
          };
        });
      })
    });
}
export default setLinks();
