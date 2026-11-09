/**
 * Gutenberg Span Wrapper – Inline-Format "Span mit Klasse".
 *
 * Bewusst ohne Build-Schritt geschrieben (kein JSX, keine Imports).
 */
( function ( wp ) {
	'use strict';

	if (
		! wp ||
		! wp.richText ||
		! wp.blockEditor ||
		! wp.components ||
		! wp.element ||
		! wp.data ||
		! wp.i18n
	) {
		return;
	}

	const {
		registerFormatType,
		applyFormat,
		removeFormat,
		getActiveFormat,
		isCollapsed,
		useAnchor,
	} = wp.richText;
	const { RichTextToolbarButton } = wp.blockEditor;
	const { Popover, FormTokenField, Button } = wp.components;
	const { createElement: el, Fragment, useState } = wp.element;
	const { __ } = wp.i18n;

	const FORMAT_NAME = 'custom/span-wrap';
	// Nicht ändern: daran werden bereits gespeicherte Spans wiedererkannt.
	const BASE_CLASS = 'custom-span';
	const TEXT_DOMAIN = 'gutenberg-span-wrap';

	if ( wp.data.select( 'core/rich-text' ).getFormatType( FORMAT_NAME ) ) {
		return;
	}

	/**
	 * Zerlegt einen class-String in einzelne Klassen (ohne Duplikate, ohne Basisklasse).
	 */
	function splitClasses( input ) {
		const seen = new Set();

		return String( input || '' )
			.split( /\s+/ )
			.filter( function ( token ) {
				if ( ! token || token === BASE_CLASS || seen.has( token ) ) {
					return false;
				}
				seen.add( token );
				return true;
			} );
	}

	/**
	 * Entfernt alles, was in einem Klassennamen nichts verloren hat.
	 * Erlaubt sind Buchstaben, Ziffern, _ und - sowie : . / für Utility-Klassen
	 * (z. B. "md:w-1/2"). Gleiche Zeichenmenge wie class_presets() in PHP.
	 */
	function cleanClass( token ) {
		return String( token ).replace( /[^A-Za-z0-9_\-:.\/]/g, '' );
	}

	function sanitizeClasses( tokens ) {
		return splitClasses(
			tokens
				.map( function ( token ) {
					// FormTokenField kann Strings oder { value }-Objekte liefern.
					return typeof token === 'string' ? token : ( token && token.value ) || '';
				} )
				.join( ' ' )
				.split( /\s+/ )
				.map( cleanClass )
				.join( ' ' )
		);
	}

	const config = window.gutenbergSpanWrap || {};
	const PRESETS = sanitizeClasses( Array.isArray( config.classes ) ? config.classes : [] );

	const icon = el(
		'svg',
		{
			xmlns: 'http://www.w3.org/2000/svg',
			viewBox: '0 0 24 24',
			width: 24,
			height: 24,
			'aria-hidden': true,
			focusable: false,
		},
		el( 'path', {
			d: 'M8.5 7.5 4 12l4.5 4.5 1.06-1.06L6.12 12l3.44-3.44L8.5 7.5Zm7 0-1.06 1.06L17.88 12l-3.44 3.44 1.06 1.06L20 12l-4.5-4.5ZM10.5 11.25h3v1.5h-3v-1.5Z',
		} )
	);

	const settings = {
		title: __( 'Span mit Klasse', TEXT_DOMAIN ),
		tagName: 'span',
		className: BASE_CLASS,
		attributes: { class: 'class' },
		edit: Edit,
	};

	function buildFormat( classes ) {
		const format = { type: FORMAT_NAME };

		if ( classes.length ) {
			format.attributes = { class: classes.join( ' ' ) };
		}

		return format;
	}

	/**
	 * Popover zum Bearbeiten der Klassen des aktiven Spans.
	 * Änderungen werden sofort übernommen.
	 */
	function ClassPopover( { value, onChange, onClose, contentRef, classes } ) {
		const anchor = useAnchor( {
			editableContentElement: contentRef ? contentRef.current : null,
			value: value,
			settings: Object.assign( {}, settings, { isActive: true } ),
		} );

		return el(
			Popover,
			{
				anchor: anchor,
				placement: 'bottom',
				offset: 8,
				shift: true,
				focusOnMount: 'firstElement',
				className: 'gsw-popover',
				onClose: onClose,
			},
			el(
				'div',
				{ className: 'gsw-popover__content' },
				el( FormTokenField, {
					label: __( 'CSS-Klassen', TEXT_DOMAIN ),
					value: classes,
					suggestions: PRESETS,
					onChange: function ( tokens ) {
						onChange( applyFormat( value, buildFormat( sanitizeClasses( tokens ) ) ) );
					},
					tokenizeOnSpace: true,
					__experimentalExpandOnFocus: PRESETS.length > 0,
					__experimentalShowHowTo: false,
					__next40pxDefaultSize: true,
					__nextHasNoMarginBottom: true,
				} ),
				el(
					'p',
					{ className: 'gsw-popover__help' },
					__( 'Mehrere Klassen mit Leertaste oder Enter trennen.', TEXT_DOMAIN )
				),
				el(
					'div',
					{ className: 'gsw-popover__actions' },
					el(
						Button,
						{
							variant: 'tertiary',
							isDestructive: true,
							onClick: function () {
								onChange( removeFormat( value, FORMAT_NAME ) );
								onClose();
							},
						},
						__( 'Span entfernen', TEXT_DOMAIN )
					),
					el(
						Button,
						{ variant: 'primary', onClick: onClose },
						__( 'Fertig', TEXT_DOMAIN )
					)
				)
			)
		);
	}

	function Edit( { isActive, value, onChange, contentRef } ) {
		const [ isOpen, setIsOpen ] = useState( false );
		const activeFormat = getActiveFormat( value, FORMAT_NAME );
		const classes = splitClasses(
			activeFormat && activeFormat.attributes ? activeFormat.attributes.class : ''
		);

		function onClick() {
			if ( ! isActive ) {
				if ( isCollapsed( value ) ) {
					wp.data.dispatch( 'core/notices' ).createInfoNotice(
						__( 'Bitte zuerst den Text markieren, der in ein Span gesetzt werden soll.', TEXT_DOMAIN ),
						{ type: 'snackbar', id: 'gutenberg-span-wrap-select-text' }
					);
					return;
				}

				onChange( applyFormat( value, buildFormat( [] ) ) );
			}

			setIsOpen( true );
		}

		return el(
			Fragment,
			null,
			el( RichTextToolbarButton, {
				icon: icon,
				title: isActive
					? __( 'Span bearbeiten', TEXT_DOMAIN )
					: __( 'Span mit Klasse', TEXT_DOMAIN ),
				onClick: onClick,
				isActive: isActive,
			} ),
			isOpen &&
				isActive &&
				el( ClassPopover, {
					value: value,
					onChange: onChange,
					onClose: function () {
						setIsOpen( false );
					},
					contentRef: contentRef,
					classes: classes,
				} )
		);
	}

	registerFormatType( FORMAT_NAME, settings );
} )( window.wp );
