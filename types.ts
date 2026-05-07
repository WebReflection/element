/**
 * List of possible aria attributes.
 * @see [ARIA Attributes Reference](https://mdn.io/ARIA/Reference/Attributes)
 */
export type AriaAttribute =
  | "activedescendant"
  | "atomic"
  | "autocomplete"
  | "braillelabel"
  | "brailleroledescription"
  | "busy"
  | "checked"
  | "colcount"
  | "colindex"
  | "colindextext"
  | "colspan"
  | "controls"
  | "current"
  | "describedby"
  | "description"
  | "details"
  | "disabled"
  | "errormessage"
  | "expanded"
  | "flowto"
  | "haspopup"
  | "hidden"
  | "invalid"
  | "keyshortcuts"
  | "label"
  | "labelledby"
  | "level"
  | "live"
  | "modal"
  | "multiline"
  | "multiselectable"
  | "orientation"
  | "owns"
  | "placeholder"
  | "posinset"
  | "pressed"
  | "readonly"
  | "relevant"
  | "required"
  | "role"
  | "roledescription"
  | "rowcount"
  | "rowindex"
  | "rowindextext"
  | "rowspan"
  | "selected"
  | "setsize"
  | "sort"
  | "valuemax"
  | "valuemin"
  | "valuenow"
  | "valuetext";

/**
 * Attribute value.
 */
export type AttributeValue =
  | bigint
  | boolean
  | number
  | string
  | null
  | undefined;

/**
 * Object to set aria labels.
 */
export type AriaLabels = Readonly<Record<string, AttributeValue>> &
  Partial<Readonly<Record<AriaAttribute, AttributeValue>>>;

/**
 * Type of tag used to create custom elements.
 */
export type CustomElementTagName = `${string}-${string}`;

/**
 * Type of tag used to create HTML elements.
 */
export type HTMLElementTag = keyof HTMLElementTagNameMap;

/**
 * Type of tag used to create SVG elements.
 */
export type SVGElementTag =
  | "svg"
  | `svg:${Exclude<keyof SVGElementTagNameMap, "svg">}`;

/**
 * Type of tag used to select an existing element.
 */
export type QuerySelectTag = `<${string}`;

/**
 * Type of `tag` argument on main function.
 */
export type Tag =
  | CustomElementTagName
  | Element
  | HTMLElementTag
  | QuerySelectTag
  | SVGElement
  | SVGElementTag;

/**
 * Base options of main function.
 */
export type BaseOptions = Readonly<{
  /**
   * An optional literal describing `aria` attributes such as `role` or `level`
   * or `labelledby`.
   */
  aria?: AriaLabels;
  /**
   * The optional class to set to the element. as `className`.
   */
  class?: string;
  /**
   * The optional class list to add to the element.
   */
  classList?: readonly string[];
  /**
   * An optional literal describing `dataset` properties.
   */
  data?: DOMStringMap;
  /**
   * An optional document to use, defaults to the global `document`.
   */
  document?: Document;
  /**
   * An optional builtin extend custom element name.
   */
  is?: CustomElementTagName;
  /**
   * The optional html to set to the element. as `innerHTML`.
   */
  html?: string;
  /**
   * The optional text to set to the element. as `textContent`.
   */
  text?: string;
  /**
   * The optional style to apply to the element.
   */
  style?: string;
}>;

/**
 * Type of `...childNodes` argument on main function.
 */
export type ChildNodes = readonly (
  | DocumentFragment
  | Element
  | Node
  | SVGElement
  | string
)[];

/**
 * Tries to infer the type of a Selector, asumes `Element | SVGElement` if can't
 * be fount on maps.
 */
export type QuerySelect<Selector> =
  | (Selector extends keyof HTMLElementTagNameMap ?
      HTMLElementTagNameMap[Selector]
    : Selector extends keyof SVGElementTagNameMap ?
      SVGElementTagNameMap[Selector]
    : Element | SVGElement)
  | null;

/**
 * Extracts selector from given {@linkcode QuerySelectTag}.
 */
export type ExtractSelector<SelectorTag extends QuerySelectTag> =
  SelectorTag extends `<${infer Selector}` ? Selector : never;

/**
 * Strips "svg:" prepend from given {@linkcode SVGElementTag}.
 */
export type ExtractSVGTag<SVGTag extends SVGElementTag> =
  SVGTag extends "svg" ? SVGTag
  : SVGTag extends `svg:${infer Tag}` ?
    Tag extends keyof SVGElementTagNameMap ?
      Tag
    : never
  : never;

/**
 * Output type that follows the following logic:
 *
 * - If the passed `tag` is a `string`:
 *   - If the string starts witn `<` tries to infer the type the same way TS infers from `document.querySelector`.
 *   - If the string is `svg` or starts with `svg:` it infers the type of the SVGElement.
 *   - If the string is a known HTMLElement, it infers the type from that.
 *   - For any other tring, it just asumes it's `Element`.
 * - If the passed `tag` is anything other than `string`, then it infers the type is the same as the received element.
 */
export type Output<PassedTag extends Tag> =
  PassedTag extends string ?
    PassedTag extends HTMLElementTag ? HTMLElementTagNameMap[PassedTag]
    : PassedTag extends SVGElementTag ?
      SVGElementTagNameMap[ExtractSVGTag<PassedTag>]
    : PassedTag extends QuerySelectTag ? QuerySelect<ExtractSelector<PassedTag>>
    : Element
  : PassedTag;

/**
 * Overrides native event listeners to have a `currentTarget` and `this` that
 * references to the current element.
 */
export type EventHandlerOverride<PassedTag extends Tag> = {
  [Key in Extract<keyof Output<PassedTag>, keyof GlobalEventHandlers>]: (
    this: Output<PassedTag>,
    event: Omit<
      Parameters<NonNullable<GlobalEventHandlers[Key]>>[0],
      "currentTarget"
    > & { currentTarget: Output<PassedTag> },
  ) => void;
};

/**
 * Adds `@` event listeners auto-completion (both as callback and tuple).
 */
export type AtEventHandlerOverride<PassedTag extends Tag> = {
  [Key in keyof EventHandlerOverride<PassedTag> as Key extends (
    `on${infer Rest}`
  ) ?
    `@${Rest}`
  : never]:
    | EventHandlerOverride<PassedTag>[Key]
    | readonly [
        handler: EventHandlerOverride<PassedTag>[Key],
        options?: boolean | AddEventListenerOptions,
      ];
};

/**
 * Gets all the given elemen properties, in the case of SVG they are inferred
 * as {@linkcode AttributeValue} because the native type for props is read-only,
 * but they can be set as attributes.
 */
export type PropertiesOrAttributes<PassedTag extends Tag> = Partial<
  Omit<
    PassedTag extends SVGElementTag | SVGElement ?
      Record<
        keyof (PassedTag extends SVGElementTag ?
          SVGElementTagNameMap[ExtractSVGTag<PassedTag>]
        : PassedTag),
        AttributeValue
      >
    : Output<PassedTag>,
    | keyof BaseOptions
    | keyof ARIAMixin
    | keyof Node
    | keyof EventHandlerOverride<PassedTag>
  > &
    EventHandlerOverride<PassedTag> &
    AtEventHandlerOverride<PassedTag>
>;

/**
 * Type of `options` argument on main function.
 */
export type Options<PassedTag extends Tag> = BaseOptions &
  PropertiesOrAttributes<PassedTag> &
  Readonly<Record<string | symbol, unknown>>;
