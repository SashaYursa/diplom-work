import { QUERY_LINK } from '../backlink.js';
export const footer = `
<div class="container">
  <div class="footer__items">
    <div class="footer__page-links">
      <h4 class="footer__page-links-header">Сторніки веб ресурсу</h4>
      <ul>
        <li><a class="footer__page-link active" href="/">Головна</a></li>
        <li><a class="footer__page-link" href="/portfolio/">Роботи</a></li>
        <li><a class="footer__page-link" href="/articles/">Пости</a></li>
        <li><a class="footer__page-link" href="/about/">Про нас</a></li>
      </ul>
    </div>
    <div class="footer__socials">
      <h4 class="footer__socials-header">Посилання на автора</h4>
      <ul class="footer__social-items">
        <li class="footer__social-item">
          <a class="footer__social-link social-link" id="facebook" href="#">
            Facebook
          </a>
          <img class="social__image" src="../dest/images/facebook-light.png" alt="social">
        </li>
        <li class="footer__social-item">
          <a class="footer__social-link social-link" id="instagram" href="#">
            Instagram
          </a>
          <img class="social__image" src="../dest/images/insta-light.png" alt="social">
        </li>
        <li class="footer__social-item">
          <a class="footer__social-link social-link" id="twitter" href="#">
            Twitter
          </a>
          <img class="social__image" src="../dest/images/twitter-light.png" alt="social">
        </li>
      </ul>
    </div>
  </div>
</div>
<div class="footer__copy">
  <h3 class="footer__copy-text">2023 Yursa</h3>
</div>
`

async function setLinks() {
  await fetch(QUERY_LINK + 'links', {
    method: 'GET'
  })
    .then(response => response.json())
    .then(links => {
      links.forEach(link => {
        document.querySelectorAll('.footer__social-link').forEach(footerLink => {
          if (footerLink.id === link.name) {
            footerLink.href = link.link;
          };
        });
      })
    });
}
export default setLinks();

