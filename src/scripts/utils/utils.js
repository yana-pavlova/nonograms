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
