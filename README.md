# @webreflection/element

<sup>**Social Media Photo by [James Owen](https://unsplash.com/@jhjowen) on [Unsplash](https://unsplash.com/)**</sup>

A minimalistic DOM element creation library.

## Installation

```sh
npm i @webreflection/element
```

## Usage

```js
import element from '@webreflection/element';
```

The *default* export is a function that accepts a `tag`, an optional `options` object, and any number of *childNodes* to append:

```ts
(tag: string | Node, options?: object, ...childNodes: (Node | string)[])
```

### The `tag`

  * If it is already an *Element*, the provided options enrich that element as described below.
  * If it is a `string` and does not start with `<`, a new *Element* with that name is created.
    * If it starts with `svg:` (followed by its name), or the `tag` value is `svg` itself, an *SVGElement* is created.
    * In every other case, an *HTMLElement* or *CustomElement* with that name is created. If `options.is` exists, a built-in custom element extension is created.
  * If it is a `string` and starts with `<`, the rest of the string is used with `document.querySelector`. If no element is found, `null` is returned.

### The `options`

Each option `key` / `value` pair enriches the created or retrieved element in a library-friendly way.

#### The `key`

  * If `key` is `children` and no extra arguments are passed and `options.children` is an array, it is compatible with latest *React* transformed *JSX* expectations and `...children` will reflect that list of entries.
  * If `key in element` is `false`:
    * **aria** and **data** attach `aria-` prefixed attributes (with `role` as an exception) or update the element `dataset`.
    * **class**, **html**, and **text** map to `className`, `innerHTML`, and `textContent`, so these properties can be set with shorter semantic names.
    * **@type** is treated as *listener* intent. If its value is an *array*, it is passed to `element.addEventListener(key.slice(1), ...value)` so listener options can be provided. Otherwise, the listener is added without options.
    * **?name** is treated as boolean attribute intent and, like *@type*, the first character is removed from the key.
  * If `key in element` is `true`:
    * **classList** adds all classes via `element.classList.add(...value)`.
    * **style** content is set via `element.style.cssText = value` or, for an *SVG* element, via `element.setAttribute('style', value)`.
    * Everything else, including **on...** handlers, is attached directly via `element[key] = value`.

#### The `value`

If `key in element` is `false`, the behavior is inferred by the value:

  * A `boolean` value that is not known in the *element* is handled via `element.toggleAttribute(key, value)`.
  * A `function` or an `object` with `handleEvent` is handled via `element.addEventListener(key, value)`.
  * An `object` without `handleEvent` is serialized as *JSON* and set via `element.setAttribute(key, JSON.stringify(value))`.
  * `null` and `undefined` are ignored.
  * Everything else is added via `element.setAttribute(key, value)`.

Read the [example](#example---live-demo) for a more complete look at how these features work together.

- - -

## Example - [Live Demo](https://webreflection.github.io/element/)

```js
// https://cdn.jsdelivr.net/npm/@webreflection/element/index.min.js for best compression
import element from 'https://esm.run/@webreflection/element';

// Direct node reference or `< css-selector` to enrich, i.e.:
// element(document.body, ...) or ...
element(
  '< body',
  {
    // override body.style.cssText = ...
    style: 'text-align: center',
    // classList.add('some', 'container')
    classList: ['some', 'container'],
    // a custom listener as object.handleEvent pattern
    ['custom:event']: {
      count: 0,
      handleEvent({ type, currentTarget }) {
        console.log(++this.count, type, currentTarget);
      },
    },
    // listener with an extra { once: true } option
    ['@click']: [
      ({ type, currentTarget }) => {
        console.log(type, currentTarget);
        currentTarget.dispatchEvent(new Event('custom:event'));
      },
      { once: true },
    ],
  },
  // body children / childNodes
  element('h1', {
    // className
    class: 'name',
    // textContent
    text: '@webreflection/element',
    style: 'color: purple',
    // role="heading" aria-level="1"
    aria: {
      role: 'heading',
      level: 1,
    },
    // dataset.test = 'ok'
    data: {
      test: 'ok',
    },
    // serialized as `json` attribute
    json: { a: 1, b: 2 },
    // direct listener
    onclick: ({ type, currentTarget }) => {
      console.log(type, currentTarget);
    },
  }),
  element(
    'svg',
    {
      width: 100,
      height: 100,
    },
    // svg children / childNodes
    element('svg:circle', {
      cx: 50,
      cy: 50,
      r: 50,
      fill: 'violet',
    })
  ),
  element('p', {
    // innerHTML
    html: 'made with ❤️ for the <strong>Web</strong>',
  })
);
```
