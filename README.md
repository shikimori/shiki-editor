[![CodeQL](https://github.com/shikimori/shiki-editor/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/shikimori/shiki-editor/actions/workflows/codeql-analysis.yml) [![Node.js CI](https://github.com/shikimori/shiki-editor/actions/workflows/tests.yml/badge.svg)](https://github.com/shikimori/shiki-editor/actions/workflows/tests.yml) 

# shiki-editor
`shiki-editor` is a wysiwyg editor based on [prosemirror](https://prosemirror.net/). To understand how it works internally please read [prosemirror guide](https://prosemirror.net/docs/guide/).

`shiki-editor` inner architecture is also highly inspired by [tiptap](https://github.com/scrumpy/tiptap) source code. Many parts of the code are taken from there.


## Installation & Run

```sh
yarn install
cd demo
yarn install
yarn start
```



#### Package release command
```sh
GITHUB_TOKEN=... npm run release
```
