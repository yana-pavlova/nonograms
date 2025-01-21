const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/script.js', // Точка входа
  output: {
    path: path.resolve(__dirname, 'dist'), // Папка сборки
    filename: 'bundle.js', // Имя выходного файла
    clean: true, // Очищает папку dist перед новой сборкой
  },
  devServer: {
    static: path.resolve(__dirname, 'dist'), // Папка для сервера
    port: 3000, // Порт для запуска
    open: true, // Автоматически открывает браузер
    hot: true, // Включает горячую перезагрузку
  },
  module: {
    rules: [
      {
        test: /\.scss$/, // Для SCSS файлов
        use: [
          MiniCssExtractPlugin.loader, // Извлечение CSS в отдельный файл
          'css-loader', // Преобразование CSS в CommonJS
          'sass-loader', // Компиляция SCSS в CSS
        ],
      },
      {
        test: /\.js$/, // Для JS файлов
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader', // Используйте Babel для совместимости с разными версиями JS
        },
      },
      {
        test: /\.html$/, // Для HTML файлов
        use: ['html-loader'], // Обработка HTML
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/, // Для изображений
        type: 'asset/resource', // Копирование изображений в сборку
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'style.css', // Имя выходного CSS файла
    }),
    new HtmlWebpackPlugin({
      template: './src/index.html', // Шаблон HTML
    }),
  ],
};
