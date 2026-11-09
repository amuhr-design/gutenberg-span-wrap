<?php
/**
 * Plugin Name:       Gutenberg Span Wrapper
 * Description:       Fügt im Block-Editor ein Inline-Format hinzu, mit dem markierter Text in ein <span> mit frei wählbaren CSS-Klassen gesetzt wird.
 * Version:           2.0.0
 * Requires at least: 6.3
 * Requires PHP:      7.4
 * Author:            amuhr design
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       gutenberg-span-wrap
 * Domain Path:       /languages
 * Update URI:        false
 *
 * Klassen-Vorschläge für den Editor lassen sich per Filter hinterlegen,
 * z. B. in der functions.php des Themes:
 *
 *     add_filter( 'gutenberg_span_wrap_classes', function ( $classes ) {
 *         return array_merge( $classes, array( 'text-primary', 'fw-bold', 'text-nowrap' ) );
 *     } );
 *
 * @package AmuhrDesign\GutenbergSpanWrap
 */

declare( strict_types=1 );

namespace AmuhrDesign\GutenbergSpanWrap;

defined( 'ABSPATH' ) || exit;

const VERSION = '2.0.0';
const HANDLE  = 'gutenberg-span-wrap';

/**
 * Basisklasse, an der der Editor die Spans dieses Plugins erkennt.
 * Nicht ändern: bestehende Inhalte würden sonst nicht mehr als Format erkannt.
 */
const BASE_CLASS = 'custom-span';

/**
 * Versions-String für Cache-Busting: Plugin-Version plus Änderungszeit der Datei.
 */
function asset_version( string $file ): string {
	$path  = __DIR__ . '/' . $file;
	$mtime = is_readable( $path ) ? filemtime( $path ) : false;

	return $mtime ? VERSION . '.' . $mtime : VERSION;
}

/**
 * Liefert die per Filter hinterlegten Klassen-Vorschläge, bereinigt und ohne Duplikate.
 *
 * @return string[]
 */
function class_presets(): array {
	/**
	 * Filtert die Klassen, die im Editor als Vorschläge angeboten werden.
	 *
	 * @param string[] $classes Liste von CSS-Klassennamen.
	 */
	$presets = apply_filters( 'gutenberg_span_wrap_classes', array() );

	if ( ! is_array( $presets ) ) {
		return array();
	}

	$clean = array();

	foreach ( $presets as $class ) {
		if ( ! is_string( $class ) ) {
			continue;
		}

		// Gleiche Zeichenmenge wie im Editor-Skript (siehe cleanClass() in span-wrap.js).
		$class = (string) preg_replace( '/[^A-Za-z0-9_\-:.\/]/', '', $class );

		if ( '' !== $class && BASE_CLASS !== $class ) {
			$clean[ $class ] = true;
		}
	}

	return array_map( 'strval', array_keys( $clean ) );
}

/**
 * Editor-Stylesheet: Popover (äußeres Dokument) und Span-Markierung (Editor-Canvas).
 */
function enqueue_editor_style(): void {
	wp_enqueue_style(
		HANDLE,
		plugins_url( 'span-wrap.css', __FILE__ ),
		array(),
		asset_version( 'span-wrap.css' )
	);
}

/**
 * Skript und Styles für den Block-Editor.
 */
function enqueue_editor_assets(): void {
	enqueue_editor_style();

	wp_enqueue_script(
		HANDLE,
		plugins_url( 'span-wrap.js', __FILE__ ),
		array(
			'wp-block-editor',
			'wp-components',
			'wp-data',
			'wp-element',
			'wp-i18n',
			'wp-notices',
			'wp-rich-text',
		),
		asset_version( 'span-wrap.js' ),
		true
	);

	wp_add_inline_script(
		HANDLE,
		'window.gutenbergSpanWrap = ' . wp_json_encode(
			array( 'classes' => class_presets() ),
			JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT
		) . ';',
		'before'
	);

	wp_set_script_translations( HANDLE, 'gutenberg-span-wrap', __DIR__ . '/languages' );
}
add_action( 'enqueue_block_editor_assets', __NAMESPACE__ . '\\enqueue_editor_assets' );

/**
 * Der Editor-Canvas läuft in einem iframe; Styles dafür müssen über
 * enqueue_block_assets kommen. Im Frontend wird nichts geladen.
 */
function enqueue_canvas_style(): void {
	if ( is_admin() ) {
		enqueue_editor_style();
	}
}
add_action( 'enqueue_block_assets', __NAMESPACE__ . '\\enqueue_canvas_style' );
