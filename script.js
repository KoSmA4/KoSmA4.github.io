'use strict';

///////////////////////////////////////
// Modal window

const modalWindow = document.querySelector('.modal-window');
const overlay = document.querySelector('.overlay');
const btnCloseModalWindow = document.querySelector('.btn--close-modal-window');
const btnsOpenModalWindow = document.querySelectorAll(
  '.btn--show-modal-window'
);
const btnScrollTo = document.querySelector('.btn--scroll-to');
const section1 = document.querySelector('#section--1');
// Вкладки
const tabs = document.querySelectorAll('.operations__tab');
const tabContainer = document.querySelector('.operations__tab-container');
const tabContents = document.querySelectorAll('.operations__content');
// Навигация
const nav = document.querySelector('.nav');
const openModalWindow = function (e) {
  e.preventDefault();
  modalWindow.classList.remove('hidden');
  overlay.classList.remove('hidden');
};

const closeModalWindow = function () {
  modalWindow.classList.add('hidden');
  overlay.classList.add('hidden');
};

btnsOpenModalWindow.forEach(button =>
  button.addEventListener('click', openModalWindow)
);

btnCloseModalWindow.addEventListener('click', closeModalWindow);
overlay.addEventListener('click', closeModalWindow);

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !modalWindow.classList.contains('hidden')) {
    closeModalWindow();
  }
});

btnScrollTo.addEventListener('click', function () {
  // Получаем координаты элемента, к которому нам нужно будет перейти
  const section1Coords = section1.getBoundingClientRect();
  console.log(section1Coords);
  // Сколько проскролили от начала браузера до кнопки
  console.log(
    'Текущее прокручивание: x, y',
    window.pageXOffset,
    window.pageYOffset
  );
  console.log(
    'Ширина и высота viewport',
    document.documentElement.clientWidth,
    document.documentElement.clientHeight
  );
  // Если сделать переход таким образом, то при нажатии на кнопку,
  // когда она находится не внизу, а неверху будет срабатывать неправльная
  // прокрутка, так как координаты берутся с верха видимого сайта
  // нужно прибавить ещё и то, на сколько было прокручено
  // Метод, который будет прокручивать страницу к конкретным координатам
  // window.scrollTo(
  //   section1Coords.left + window.pageXOffset,
  //   section1Coords.top + window.pageYOffset
  // );
  // Сейчас мы сделаем прокрутку плавной
  // window.scrollTo({
  //   left: section1Coords.left + window.pageXOffset,
  //   top: section1Coords.top + window.pageYOffset,
  //   behavior: 'smooth', //Поведение скролла - мягкое
  // });
  // Это довольно старый, хоть и рабочий способ прокрутки
  // Но сейчас есть ещё один, более простой
  section1.scrollIntoView({ behavior: 'smooth' });
  // Важно понимать, что эту функцию поддерживают только новые браузеры
});
// 1. Добавляем event Listener для ОБЩЕГО родителя
document.querySelector('.nav__links').addEventListener('click', function (e) {
  console.log(e.target);
  e.preventDefault();
  // 2. Определить target элемент
  if (e.target.classList.contains('nav__link')) {
    const href = e.target.getAttribute('href');
    console.log(href);
    document.querySelector(href).scrollIntoView({ behavior: 'smooth' });
  }
});

// Вкладки
tabContainer.addEventListener('click', function (e) {
  const clickedButton = e.target;
  // Если мы не получаем кнопку, то чтобы не получить ошибку, выходим из функции
  if (!clickedButton) return;

  // Активная вкладка
  tabs.forEach(tab => tab.classList.remove('operations__tab--active'));
  clickedButton.classList.add('operations__tab--active');

  // Активный контент
  tabContents.forEach(content =>
    content.classList.remove('operations__content--active')
  );

  document
    .querySelector(`.operations__content--${clickedButton.dataset.tab}`)
    .classList.add('operations__content--active');
});

// Анимация потускнения на панели навигации

const navLinksHoverAnimation = function (e, opacity) {
  if (e.target.classList.contains('nav__link')) {
    const linkOver = e.target;
    const siblingLinks = linkOver
      .closest('.nav__links')
      .querySelectorAll('.nav__link');
    const logo = linkOver.closest('.nav').querySelector('img');
    const logoText = linkOver.closest('.nav').querySelector('.nav__text');
    siblingLinks.forEach(link => (link.style.opacity = opacity));
    logo.style.opacity = opacity;
    logoText.style.opacity = opacity;
    linkOver.style.opacity = 1;
  }
};

nav.addEventListener('mouseover', function (e) {
  navLinksHoverAnimation(e, 0.4);
});

nav.addEventListener('mouseout', function (e) {
  navLinksHoverAnimation(e, 1);
});

// Sticky navigation - Intersection Observer API
const header = document.querySelector('.header');
const getStickyNav = function (entries) {
  const entry = entries[0];
  // Когда перестаём видеть header
  if (!entry.isIntersecting) nav.classList.add('sticky');
  // Как только видно хоть чуть-чуть header
  else if (entry.isIntersecting) nav.classList.remove('sticky');
  // И теперь везде на сайте, где у нас нет target element - header
  // Мы и будем видеть sticky navigation
};

const headerObserver = new IntersectionObserver(getStickyNav, {
  root: null,
  threshold: 0, //Видно 0% header
  rootMargin: '-100px',
  // К header добавляется ещё прямоугольник 100px, чтобы он не закрывал нижние блоки
  // Панель навигации стала появляться чуть позже на 90px
});
headerObserver.observe(header);

// Появление секций сайтов
const allSections = document.querySelectorAll('.section');

const appearanseSection = function (entries, observer) {
  const entry = entries[0];
  // console.log(entry);
  if (!entry.isIntersecting) return;
  entry.target.classList.remove('section--hidden');
  // Удалили observer, чтобы не выполнялась лишняя работа, так как после
  // того, как весь контент был показан, всё равно продолжал работать
  observer.unobserve(entry.target);
};

const sectionObserver = new IntersectionObserver(appearanseSection, {
  root: null,
  threshold: 0.15,
});

allSections.forEach(function (section) {
  sectionObserver.observe(section);
  // section.classList.add('section--hidden');
});

// Имплементация lazy loading для изображений
// Найдём все элементы img с атрибутом data-src
const lazyImages = document.querySelectorAll('img[data-src]');
const loadImages = function (entries, observer) {
  const entry = entries[0];
  if (!entry.isIntersecting) return;
  // Меняем на изображение с высоким разрешением
  entry.target.src = entry.target.dataset.src;
  // Проверяем, что наше изображение загрузилось полностью, только потом будем снимать фильтр
  entry.target.addEventListener('load', function () {
    entry.target.classList.remove('lazy-img');
  });
  observer.unobserve(entry.target);
};
const lazyImagesObserver = new IntersectionObserver(loadImages, {
  root: null,
  threshold: 0.1,
  rootMargin: '200px',
});
lazyImages.forEach(image => lazyImagesObserver.observe(image));

// Создание слайдера
const slides = document.querySelectorAll('.slide');
const slider = document.querySelector('.slider');
const btnLeft = document.querySelector('.slider__btn--left');
const btnRight = document.querySelector('.slider__btn--right');
const dotContainer = document.querySelector('.dots');

let currentSlide = 0;
const slidesNumber = slides.length;
// Функция которая программно создаёт точки, с тем количеством, которое нам нужно
const createDots = function () {
  slides.forEach(function (slide, index) {
    dotContainer.insertAdjacentHTML(
      'beforeend',
      `<button class = "dots__dot" data-slide = "${index}"></button>`
    );
  });
};
createDots();

const activateCurrentDote = function (slide) {
  document
    .querySelectorAll('.dots__dot')
    .forEach(dot => dot.classList.remove('dots__dot--active'));
  document
    .querySelector(`.dots__dot[data-slide="${slide}"]`)
    .classList.add('dots__dot--active');
};
activateCurrentDote(0);

const moveToSlide = function (slide) {
  slides.forEach(
    (s, index) => (s.style.transform = `translateX(${(index - slide) * 100}%)`)
  );
};
moveToSlide(0);
const previousSlide = function () {
  // Уменьшаем конкретный слайд, чтобы осуществлять прокрутку
  if (currentSlide === 0) currentSlide = slidesNumber - 1;
  else currentSlide--;
  // Для каждого слайда теперь меняем translateX
  moveToSlide(currentSlide);
  activateCurrentDote(currentSlide);
};

const nextSlide = function () {
  // Увеличиваем конкретный слайд, чтобы осуществлять прокрутку
  if (currentSlide === slidesNumber - 1) currentSlide = 0;
  else currentSlide++;
  // Для каждого слайда теперь меняем translateX
  moveToSlide(currentSlide);
  activateCurrentDote(currentSlide);
};

// Имплементируем нажатие левой кнопки
btnLeft.addEventListener('click', previousSlide);

// Имплементируем нажатие правой кнопки
btnRight.addEventListener('click', nextSlide);
// Добавили функциональность для нажатия на клавиши на компьютере
document.addEventListener('keydown', function (e) {
  if (e.key === 'ArrowLeft') previousSlide();
  else if (e.key === 'ArrowRight') nextSlide();
});
dotContainer.addEventListener('click', function (e) {
  // dotContainer.forEach(dot => dot.classList.remove('dots__dot--active'));
  if (e.target.classList.contains('dots__dot')) {
    const slide = e.target.dataset.slide;
    // slide.classList.add('dots__dot--active');
    moveToSlide(Number(slide));
    activateCurrentDote(slide);
  }
});

/////////////////////////////////////////////////////////////////////////
// Жизненный цикл DOM элементов
document.addEventListener('DOMContentLoaded', function (e) {
  console.log('Дерево DOM было создано', e);
});
// Тут мы можем проверить, было ли создано DOM дерево, но каждый раз такую проверку делать не нужно
// всё потому, что файл script.js, подключён в конце HTML файла и это автоматически значит
// что наш JS файл будет работать с уже сформарованным DOM деревом
// Тут мы проверям когда вся наша страница была загружена
window.addEventListener('load', function (e) {
  console.log('Страница полностью загружена', e);
});
// Тут мы спросим у пользователя, точно ли он хочет покинуть страницу
window.addEventListener('beforeunload', function (e) {
  e.preventDefault();
  console.log(e);
  e.returnValue = '';
  console.log('Страница ещё не загружена', e);
});
