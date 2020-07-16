/* eslint max-len: 0 */
import Vue from 'vue';
import Demo from './demo.vue';

import 'reset-css/reset.css';
import '@/stylesheets/application.sass';
import '@/stylesheets/prosemirror.sass';

import './../../packages/shiki-uploader/index.sass';
import './../../packages/shiki-utils/index.sass';

Vue.config.productionTip = false;
Vue.config.devtools = false;

const TRANSLATIONS = {
  'frontend.shiki_editor.bold': ' Жирный',
  'frontend.shiki_editor.italic': ' Курсив',
  'frontend.shiki_editor.underline': ' Подчёркнутый',
  'frontend.shiki_editor.strike': ' Зачёркнутый',
  'frontend.shiki_editor.undo': ' Отменить последнее изменение',
  'frontend.shiki_editor.redo': ' Повторить последнее изменение',
  'frontend.shiki_editor.prompt.image_url': ' URL картинки',
  'frontend.shiki_editor.prompt.link_url': ' URL ссылки',
  'frontend.shiki_editor.prompt.spoiler_label': 'Заголовок спойлера',
  'frontend.shiki_editor.spoiler': 'Спойлер',
  'frontend.lib.file_uploader.uploading_file': 'загрузка файла %{filename} (%{filesize} KB)',
  'frontend.lib.file_uploader.uploading_files': 'загрузка файлов %{uploadedCount} из %{totalCount} (%{kbUploaded} / %{kbTotal} KB)',
  'frontend.lib.file_uploader.drop_pictures_here': 'Перетаскивай сюда картинки',
  'frontend.lib.file_uploader.file_type_not_allowed': 'Файл не является изображением'
};

window.I18n = {
  locale: 'ru',
  t: key => TRANSLATIONS[key] || `:${key}`
};

new Vue({
  render: h => h(Demo)
}).$mount('#app');
