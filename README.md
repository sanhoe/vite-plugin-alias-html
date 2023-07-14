# vite-plugin-alias-html

Vite plugin for resolving aliases in HTML. This plugin applies the `resolve.alias` property in `vite.config.js` to HTML files.

## Install

```bash
npm i vite-plugin-alias-html -D
```

## Usage

```js
// vite.config.js
import { defineConfig } from 'vite';
import vitePluginAliasHtml from 'vite-plugin-alias-html';

export default defineConfig({
    resolve: {
        alias: [
            {
                find: '~common',
                replacement: path.resolve(__dirname, './src/common'),
            },
            {
                find: '~pages',
                replacement: path.resolve(__dirname, './src/pages'),
            },
        ],
    },
    plugins: [vitePluginAliasHtml()],
})
```
