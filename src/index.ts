import { lstatSync } from 'node:fs';
import { relative, dirname } from 'node:path';
import { parseFragment as parse, serialize } from 'parse5';
import type { Plugin } from 'vite';
import type { Node, ParentNode, ChildNode, Document, DocumentFragment, Element, CommentNode, TextNode, Template, DocumentType } from 'npm:parse5/dist/tree-adapters/default.d.ts'

export default function vitePluginAliasHtml(): Plugin {

    let viteAlias: Record<string, string> | Array<{ find: string | RegExp, replacement: string }>;

    return {
        name: 'vite-plugin-alias-html',
        configResolved(resolvedConfig) {
            viteAlias = resolvedConfig.resolve.alias || [];
        },
        transformIndexHtml: {
            enforce: 'pre',
            transform(html, ctx) {
                const ctxFilename = ctx.filename;
                const isDirectory = lstatSync(ctxFilename).isDirectory();

                function flatten(el: ChildNode[], list: ChildNode[] = []) {
                    el.forEach((item) => {
                        list.push(item);

                        if ('childNodes' in item && item.childNodes.length > 0) {
                            flatten(item.childNodes, list);
                        }

                        if ('tagName' in item && item.tagName === 'template' && 'content' in item && item.content.childNodes.length > 0) {
                            flatten(item.content.childNodes, list);
                        }
                    });

                    return list;
                }

                function replace(attr: { name: string, value: string }, list: Array<{ find: string | RegExp, replacement: string }>) {
                    list.forEach(item => {
                        if (!String(item.find).includes('@vite')) {
                            const path = isDirectory
                                ? relative(ctxFilename, item.replacement)
                                : relative(dirname(ctxFilename), item.replacement);

                            const pattern = item.find instanceof RegExp
                                ? item.find
                                : new RegExp(`${item.find}`, 'g');

                            attr.value = attr.value.replace(pattern, path);
                        }
                    });
                }

                const parsed = parse(html);
                const nodeList = flatten(parsed.childNodes);
                const aliasList = Array.isArray(viteAlias)
                    ? viteAlias
                    : Object.entries(viteAlias).reduce((result, item) => {
                        result.push({ find: item[0], replacement: item[1] });
                        return result;
                    }, [] as Array<{ find: string | RegExp, replacement: string }>);

                nodeList.forEach(node => {
                    if ('attrs' in node) {
                        node.attrs.forEach(attr => {
                            if (attr.name === 'src' || attr.name === 'href' || attr.name === 'srcset') {
                                replace(attr, aliasList);
                            }
                        });
                    }
                });

                return serialize(parsed);
            }
        }
    };
}
