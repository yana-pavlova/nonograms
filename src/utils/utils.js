export const createElement = (options) => {
  const { tag = 'div', text = '', classes = [] } = options;
  const element = document.createElement(tag);

  element.textContent = text;

  if (classes.length > 0) element.classList.add(...classes);

  if (tag === 'button') element.type = 'button';

  return element;
};

export const changeTheme = (theme) => {
  document.body.className = 'page';
  document.body.classList.add(`theme_${theme}`);
  localStorage.setItem('theme', theme);
};
