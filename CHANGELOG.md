# Changelog

## 2.0.0

- Popover for adding, editing and removing classes; replaces the browser prompt and the sidebar panel
- Several classes per span
- Class suggestions through the `gutenberg_span_wrap_classes` filter
- Class names are cleaned on input
- Spans are outlined in the editor
- Removed the KSES filter that allowed `<span class>` in every context, including comments
- Fixed: clicking the button on an existing span removed it instead of editing it
- Fixed script dependencies (`wp-block-editor`, `wp-components`; removed deprecated `wp-editor`)
- Requires WordPress 6.3 and PHP 7.4

## 1.0

- Initial version
