# Gutenberg Span Wrapper

A small WordPress plugin that adds an inline format to the block editor: select text, click the toolbar button, and the selection is wrapped in a `<span>` with CSS classes of your choice.

It is meant for sites that style text with a CSS framework (Bootstrap, utility classes) or with their own theme classes and need those classes on parts of a sentence, not only on whole blocks.

The editor interface is currently in German. All strings are translatable (text domain `gutenberg-span-wrap`).

## Features

- Toolbar button in every rich-text block (paragraph, heading, list, …)
- Popover to add, edit and remove classes; several classes per span
- Optional class suggestions, defined per site with a filter
- Spans are outlined in the editor so they are easy to find; nothing is loaded on the front end
- No settings page, no database entries, no build step

## Requirements

- WordPress 6.3 or newer
- PHP 7.4 or newer

## Installation

1. Download `gutenberg-span-wrap.zip` from the [latest release](../../releases/latest).
   Use this file, not GitHub's "Source code" archive: WordPress needs the folder inside the ZIP to be named `gutenberg-span-wrap`.
2. In WordPress, go to **Plugins → Add New → Upload Plugin**, choose the ZIP and activate the plugin.

## Usage

1. Select text in the block editor.
2. Click the **Span** button (`< – >`) in the block toolbar.
3. Type one or more class names in the popover. Space or Enter confirms a class.

To change or remove a span later, place the cursor inside it and click the button again.

The saved markup looks like this:

```html
<span class="custom-span text-primary fw-bold">Text</span>
```

The class `custom-span` is always added. The editor uses it to recognise spans created by this plugin.

Class names may contain letters, digits, `_`, `-`, `:`, `.` and `/`. Other characters are removed.

## Class suggestions

Add the classes you use most to the suggestion list, for example in your theme's `functions.php`:

```php
add_filter( 'gutenberg_span_wrap_classes', function ( $classes ) {
	return array_merge( $classes, array( 'text-primary', 'fw-bold', 'text-nowrap' ) );
} );
```

## Uninstalling

Deactivate and delete the plugin. Existing spans stay in your content as plain HTML and keep working on the front end.

## License

GPL-2.0-or-later. See [LICENSE](LICENSE).

This plugin is provided free of charge and without warranty, as described in the license.
