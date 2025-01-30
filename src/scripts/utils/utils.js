export const createElement = ({
  tag = 'div',
  classes = [],
  text = '',
  ...props
}) => {
  const element = document.createElement(tag);
  if (classes.length) element.classList.add(...classes.filter(Boolean));
  if (text) element.textContent = text;

  Object.entries(props).forEach(([key, value]) => {
    if (key === 'dataset') {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        element.dataset[dataKey] = dataValue;
      });
    } else {
      element[key] = value;
    }
  });

  return element;
};

export const changeTheme = (theme) => {
  document.body.classList.remove('theme_light', 'theme_dark');
  document.body.classList.add(`theme_${theme}`);
};

export const padWithZero = (number) => String(number).padStart(2, '0');

export const saveDataInLocalStorage = (data, name) => {
  if (name === 'win') {
    const maxItems = 5;
    const storedData =
      getDataFromLocalStorage(name) === null
        ? []
        : getDataFromLocalStorage(name);
    storedData.push(data);
    if (storedData.length > maxItems) {
      storedData.shift();
    }
    localStorage.setItem(name, JSON.stringify(storedData));
  } else {
    localStorage.setItem(name, JSON.stringify(data));
  }
};

export const getDataFromLocalStorage = (name) =>
  JSON.parse(localStorage.getItem(name));

export const checkIfThereIsDataInLocalStorage = (name) =>
  Boolean(localStorage.getItem(name));

export const handleOverlayClick = (event, popup) => {
  console.log(popup, event.target);
  if (popup.contains(event.target)) {
    popup.style.display = 'none';
    document.body.classList.remove('no-scroll');
  }
};
