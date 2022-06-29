// /* eslint max-len: 0 */
import { createApp } from 'vue';
import Demo from './demo.vue';

import 'reset-css/reset.css';
import '@/stylesheets/application.sass';

import 'shiki-uploader/index.sass';
import 'shiki-utils/flash.sass';

const TRANSLATIONS = {
  'frontend.lib.please_try_again_later': 'Ошибка. Попробуй еще раз позже',
  'frontend.shiki_editor.bold': ' Жирный',
  'frontend.shiki_editor.italic': ' Курсив',
  'frontend.shiki_editor.color': ' Цвет',
  'frontend.shiki_editor.underline': ' Подчёркнутый',
  'frontend.shiki_editor.strike': ' Зачёркнутый',
  'frontend.shiki_editor.undo': ' Отменить последнее изменение',
  'frontend.shiki_editor.redo': ' Повторить последнее изменение',
  'frontend.shiki_editor.prompt.image_url': ' URL картинки',
  'frontend.shiki_editor.prompt.link_url': ' URL ссылки',
  'frontend.shiki_editor.prompt.spoiler_label': 'Заголовок спойлера',
  'frontend.shiki_editor.spoiler': 'Спойлер',
  'frontend.shiki_editor.spoiler_inline': 'Спойлер',
  'frontend.shiki_editor.code_inline': 'Код',
  'frontend.shiki_editor.link': 'Ссылка',
  'frontend.shiki_editor.smiley': 'Смайлик',
  'frontend.shiki_editor.image': 'Картинка по ссылке',
  'frontend.shiki_editor.shiki_link': 'Шики ссылка',
  'frontend.shiki_editor.upload': 'Загрузка картинок',
  'frontend.shiki_editor.spoiler_block': 'Блок спойлера',
  'frontend.shiki_editor.code_block': 'Блок кода',
  'frontend.shiki_editor.bullet_list': 'Список',
  'frontend.shiki_editor.blockquote': 'Цитата',
  'frontend.shiki_editor.huge_content_mode':
    'Слишком много контента. Визуальный редактор не справится и поэтому отключён.',
  'frontend.shiki_editor.huge_content_pasted':
    'Слишком много контента. Визуальный редактор не справится, и поэтому вставка была отменена.',
  'frontend.shiki_editor.normal_content_mode': 'Визуальный редактор снова доступен',
  'frontend.shiki_editor.unsaved_content_mode.label':
    'В редакторе остался не сохранённый текст. Восстановить?',
  'frontend.shiki_editor.unsaved_content_mode.yes': 'Да',
  'frontend.shiki_editor.unsaved_content_mode.no': 'Нет',
  'frontend.shiki_editor.unsaved_content_mode.draft': 'Текст',
  'frontend.shiki_editor.preview': 'Предпросмотр',
  'frontend.shiki_editor.source': 'Код',
  'frontend.lib.loading': 'Загрузка...',
  'frontend.lib.nothing_found': 'Ничего не найдено',
  'frontend.lib.file_uploader.uploading_file': 'загрузка файла %{filename} (%{filesize} KB)',
  'frontend.lib.file_uploader.uploading_files': 'загрузка файлов %{uploadedCount} из %{totalCount} (%{kbUploaded} / %{kbTotal} KB)', // eslint-disable-line
  'frontend.lib.file_uploader.drop_pictures_here': 'Перетаскивай сюда картинки',
  'frontend.lib.file_uploader.file_type_not_allowed': 'Файл не является изображением',
  'frontend.shiki_editor.colors.yellow': 'Жёлтый',
  'frontend.shiki_editor.colors.orange': 'Оранжевый',
  'frontend.shiki_editor.colors.red': 'Красный',
  'frontend.shiki_editor.colors.pink': 'Розовый',
  'frontend.shiki_editor.colors.violet': 'Фиолетовый',
  'frontend.shiki_editor.colors.blue': 'Синий',
  'frontend.shiki_editor.colors.green': 'Зелёный',
  'frontend.shiki_editor.colors.brown': 'Коричневый',
  'frontend.shiki_editor.colors.gray': 'Серый',
  'frontend.shiki_editor.colors.black': 'Чёрный',
  'frontend.shiki_editor.headlines.header_1': '# Большой заголовок',
  'frontend.shiki_editor.headlines.header_2': '## Средний заголовок',
  'frontend.shiki_editor.headlines.header_3': '### Малый заголовок',
  'frontend.shiki_editor.headlines.headline': '#### Большой шики-заголовок',
  'frontend.shiki_editor.headlines.midheadline': '##### Средний шики-заголовок'
};

window.I18n = {
  locale: 'ru',
  t: key => TRANSLATIONS[key] || `:${key}`
};

createApp(Demo).mount('#app');
