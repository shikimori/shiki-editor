<template>
  <div class='container'>
    <div class='block'>
      <div class='headline'>shiki-utils flash with shiki-decorators</div>
      <div class='samples'>
        <button @click='info'>info</button>
        <button @click='error'>error</button>
        <button @click='notice'>notice</button>
        <button @click='noticeThrottled'>notice throttled 2s</button>
        <button @click='noticeDebounced'>notice debounced 500ms</button>
        <button @click='noticeDebouncedThrottled'>
          notice debounced 500ms throttled 2s
        </button>
      </div>
    </div>

    <div class='block'>
      <div class='headline'>shiki-editor</div>
      <div class='samples'>
        <label><input v-model='isColumn1' type='checkbox'>Sample 1</label>
        <label><input v-model='isColumn2' type='checkbox'>Sample 2</label>
      </div>

      <div class='fc-2'>
        <div v-if='isColumn1' class='f-column'>
          <ShikiEditorApp
            ref='editor1'
            :content='text1'
            :shiki-request='shikiRequest'
            :shiki-uploader='shikiUploader1'
            localization-field='name'
            @update='(value) => text1 = value'
          />
        </div>
        <div v-if='isColumn2' class='f-column'>
          <ShikiEditorApp
            ref='editor2'
            :content='text2'
            :shiki-request='shikiRequest'
            :shiki-uploader='shikiUploader2'
            localization-field='name'
            @update='(value) => text2 = value'
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint max-len: 0 */
import axios from 'axios';
// import { ShikiEditorApp } from 'shiki-editor';
// import { flash } from 'shiki-utils';
import { throttle, debounce } from 'shiki-decorators';
import ShikiUploader from 'shiki-uploader';
import { ShikiEditorApp } from '../../index';
import { flash, ShikiRequest } from 'shiki-utils';
// import { flash, ShikiRequest } from '../../packages/shiki-utils';
// import { throttle, debounce } from '../../packages/shiki-decorators';
// import ShikiUploader from '../../../shiki-uploader';

let TEXT_2 = `
> qwe[br]
z

> [quote]
> line1[/quote]
`.trim();


export default {
  name: 'App',
  components: {
    ShikiEditorApp
  },
  data: () => ({
    uploadHeaders: () => ({}),
    isColumn1: !TEXT_2.length,
    isColumn2: !!TEXT_2.length,
    text1: `
# Заголовки
[hr]
# Заголовок уровень 1
\`\`\`
# Заголовок уровень 1
\`\`\`

## Заголовок уровень 2
\`\`\`
## Заголовок уровень 2
\`\`\`

### Заголовок уровень 3
\`\`\`
### Заголовок уровень 3
\`\`\`

#### Спец заголовок 1
\`\`\`
#### Спец заголовок 1
\`\`\`

##### Спец заголовок 2
\`\`\`
##### Спец заголовок 2
\`\`\`

# Черта после заголовка
[hr]
# Заголовок уровень 1
[hr]
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam elit lorem, eleifend auctor posuere eget, placerat quis augue. Nunc vitae dui nec lectus eleifend elementum. Duis iaculis quam quis mi ullamcorper, eget consequat felis finibus. Phasellus scelerisque lacus egestas, fermentum purus sit amet, mattis neque. Fusce non lorem malesuada, feugiat urna id, molestie diam. Vestibulum a turpis quis nulla pharetra posuere eu ac elit. Sed vitae felis venenatis, tempor magna at, efficitur ipsum.
\`\`\`
# Заголовок уровень 1
[hr]
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam elit lorem, eleifend auctor posuere eget, placerat quis augue. Nunc vitae dui nec lectus eleifend elementum. Duis iaculis quam quis mi ullamcorper, eget consequat felis finibus. Phasellus scelerisque lacus egestas, fermentum purus sit amet, mattis neque. Fusce non lorem malesuada, feugiat urna id, molestie diam. Vestibulum a turpis quis nulla pharetra posuere eu ac elit. Sed vitae felis venenatis, tempor magna at, efficitur ipsum.
\`\`\`

## Заголовок уровень 2
[hr]
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam elit lorem, eleifend auctor posuere eget, placerat quis augue. Nunc vitae dui nec lectus eleifend elementum. Duis iaculis quam quis mi ullamcorper, eget consequat felis finibus. Phasellus scelerisque lacus egestas, fermentum purus sit amet, mattis neque. Fusce non lorem malesuada, feugiat urna id, molestie diam. Vestibulum a turpis quis nulla pharetra posuere eu ac elit. Sed vitae felis venenatis, tempor magna at, efficitur ipsum.
\`\`\`
## Заголовок уровень 2
[hr]
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam elit lorem, eleifend auctor posuere eget, placerat quis augue. Nunc vitae dui nec lectus eleifend elementum. Duis iaculis quam quis mi ullamcorper, eget consequat felis finibus. Phasellus scelerisque lacus egestas, fermentum purus sit amet, mattis neque. Fusce non lorem malesuada, feugiat urna id, molestie diam. Vestibulum a turpis quis nulla pharetra posuere eu ac elit. Sed vitae felis venenatis, tempor magna at, efficitur ipsum.
\`\`\`

### Заголовок уровень 3
[hr]
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam elit lorem, eleifend auctor posuere eget, placerat quis augue. Nunc vitae dui nec lectus eleifend elementum. Duis iaculis quam quis mi ullamcorper, eget consequat felis finibus. Phasellus scelerisque lacus egestas, fermentum purus sit amet, mattis neque. Fusce non lorem malesuada, feugiat urna id, molestie diam. Vestibulum a turpis quis nulla pharetra posuere eu ac elit. Sed vitae felis venenatis, tempor magna at, efficitur ipsum.
\`\`\`
### Заголовок уровень 3
[hr]
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam elit lorem, eleifend auctor posuere eget, placerat quis augue. Nunc vitae dui nec lectus eleifend elementum. Duis iaculis quam quis mi ullamcorper, eget consequat felis finibus. Phasellus scelerisque lacus egestas, fermentum purus sit amet, mattis neque. Fusce non lorem malesuada, feugiat urna id, molestie diam. Vestibulum a turpis quis nulla pharetra posuere eu ac elit. Sed vitae felis venenatis, tempor magna at, efficitur ipsum.
\`\`\`


# Shiki BbCodes
[hr]
[div fc-2][div f-column]
[anime=1] text after [anime=1]Anime name[/anime]
[manga=1]
[anime=3456789]missing anime[/anime]
[ranobe=9115]

[image=1124146]
[/div][div f-column]
[entry=314310]
[topic=314310]
[comment=6104628]
[message=1278854609]

[topic=99999999999]
[topic=99999999999]missing topic[/topic]
[comment=99999999999]
[message=99999999999]
[/div][/div]


# Basic styles
[hr]
B[b]old tex[/b]t
I[i]talic tex[/i]t
U[u]nderlined tex[/u]t
S[s]triked tex[/s]t
Inline c\`ode tex\`t
Inline s||poiler tex||t    \`||spoiler content||\`
C[color=red]olored tex[/color]t   \`[color=red]...[/color]\`
s[size=18]ized tex[/size]t   \`[size=18]...[/size]\`
L[url=https://github.com/shikimori/shiki-editor]ink tex[/url]t

# Spoilers
[hr]
### Block spoiler
[spoiler=spoiler block with label]
spoiler \`content\`
[/spoiler]
[spoiler]
spoiler content
[/spoiler]

### Inline spoiler
||Inline spoiler text||    \`||spoiler content||\`

# Code
[hr]
### Block code
\`\`\`
code block
\`\`\`
\`\`\`css
.css /* code block */ { color: red; }
\`\`\`

### Inline code
\`inlinde code\` made by text wrapped in \`\` \`quotes\` \`\`

# Smileys
[hr]
:) :shock:

# Images
[hr]
Image
[img no-zoom 225x317]https://kawai.shikimori.one/system/animes/original/38481.jpg?1592053805[/img]     [img no-zoom width=200]https://kawai.shikimori.one/system/animes/original/38481.jpg?1592053805[/img]     [img]https://kawai.shikimori.one/system/animes/original/38481.jpg?1592053805[/img] [img]https://kawai.shikimori.one/system/users/x160/1.png?1591612283[/img]
Poster
[poster]https://www.ljmu.ac.uk/~/media/ljmu/news/starsedit.jpg[/poster]

# Divs and Spans
[hr]
[div=b-link_button]
\`[div=b-link_button]...[/div]\`
[/div]

\`[div=fc-2][div=f-column][/div][div=f-column][/div][/div]\`

[div=fc-2]
[div=f-column]
\`[div=f-column]\`
[/div]
[div=f-column]
\`[div=f-column]\`
[/div]
[/div]

[hr]

[right]\`[right]...[/right]\`[/right]
[center]\`[center]...[/center]\`[/center]

div [div=b-link_button]inline divs are not parsed by editor[/div] div
Instead use \`[span]\` bbcode [span=b-anime_status_tag anons]as inline element[/span]
\`\`\`
Instead use \`[span]\` bbcode [span=b-anime_status_tag anons]as inline element[/span]
\`\`\`

# Quotes and Lists
[hr]
### Bullet list
- Bullet List
- def

### Quote
> Quote
> > nope
> yes

### Bullet and Quote combined
> - \`quoted\` list
- > list \`quoted\`

### Old Quote
[quote]Old style quote support[/quote]
[quote=zxc]Old style quote with nickname[/quote]
[quote=c1246;1945;Silentium°]Old style quote with user[/quote]

# Videos
[hr]
[video]https://www.youtube.com/watch?v=0d4rPwIpzNw[/video] [video]https://www.youtube.com/watch?v=00000000000[/video] [video]https://www.youtube.com/watch?v=JyTvVtUr_2g&t=762s[/video] [video]http://video.sibnet.ru/video1234982-03__Poverivshiy_v_grezyi[/video] [video]https://video.sibnet.ru/video305613-SouL_Eater__AMW/[/video] [video]http://vimeo.com/426453510[/video] [video]https://vk.com/video-186803452_456239969[/video] [video]http://vk.com/video98023184_165811692[/video] [video]https://coub.com/view/1itox4[/video] [video]https://ok.ru/video/2444260543117[/video]
`.trim(),
    text2: TEXT_2,
    test: new Test()
  }),
  computed: {
    locale() {
      return window.I18n.locale;
    },
    origin() {
      return process.env.VUE_APP_USER === 'morr' ?
        'http://shikimori.local' :
        'https://shikimori.one';
    },
    uploadEndpoint() {
      return `${this.origin}/api/user_images?linked_type=Comment` + (
        process.env.NODE_ENV === 'development' ? '&test=1' : ''
      );
    },
    shikiRequest() {
      return new ShikiRequest(this.origin, axios);
    },
    shikiUploader1() {
      return new ShikiUploader({
        locale: this.locale,
        xhrEndpoint: this.uploadEndpoint,
        xhrHeaders: this.uploadHeaders,
        maxNumberOfFiles: 10
      });
    },
    shikiUploader2() {
      return new ShikiUploader({
        locale: this.locale,
        xhrEndpoint: this.uploadEndpoint,
        xhrHeaders: this.uploadHeaders,
        maxNumberOfFiles: 10
      });
    }
  },
  async mounted() {
    window.shikiTokenizer = (this.$refs.editor1 || this.$refs.editor2)
      .editor.markdownParser.tokenizer;

    // await this.$nextTick();
    // this.$refs.editor2.toggleSource();
  },
  methods: {
    info() {
      flash.info('flash.info');
    },
    error() {
      flash.error('flash.error');
    },
    notice() {
      flash.notice('flash.notice');
    },
    noticeThrottled() {
      this.test.throttled();
    },
    noticeDebounced() {
      this.test.debounced();
    },
    noticeDebouncedThrottled() {
      this.test.debouncedThrottled();
    }
  }
};

class Test {
  @throttle(2000)
  throttled() {
    flash.notice('throttled 2s flash.notice');
  }

  @debounce(500)
  debounced() {
    flash.notice('debounced 500ms flash.notice');
  }

  @debounce(500)
  @throttle(2000)
  debouncedThrottled() {
    flash.notice('debounced 500ms throttled 2s flash.notice');
  }
}
</script>

<style scoped lang='sass'>
.f-column:first-child:last-child
  width: 100%

.samples
  margin-bottom: 4px

  button
    margin-right: 16px

  label
    display: inline-flex
    margin-right: 16px
    align-items: center

    input
      margin-right: 5px
</style>
