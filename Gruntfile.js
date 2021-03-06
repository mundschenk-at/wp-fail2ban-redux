module.exports = function( grunt ) {

	'use strict';
	var SOURCE_DIR = '',
		BUILD_DIR = 'build/',

		WPF2BR_EXCLUDED_MISC = [
			'!**/assets/**',
			'!**/bin/**',
			'!**/build/**',
			'!**/coverage/**',
			'!**/node_modules/**',
			'!**/tests/**',
			'!Gruntfile.js*',
			'!package.json*',
			'!phpunit.xml*',
			'!.*'
		];

	// Load tasks.
	require( 'matchdep' ).filterDev([ 'grunt-*', '!grunt-legacy-util' ]).forEach( grunt.loadNpmTasks );

	// Project configuration
	grunt.initConfig( {

		pkg: grunt.file.readJSON( 'package.json' ),

		checktextdomain: {
			options: {
				text_domain: 'wp-fail2ban-redux',
				correct_domain: false,
				keywords: [
					'__:1,2d',
					'_e:1,2d',
					'_x:1,2c,3d',
					'_n:1,2,4d',
					'_ex:1,2c,3d',
					'_nx:1,2,4c,5d',
					'esc_attr__:1,2d',
					'esc_attr_e:1,2d',
					'esc_attr_x:1,2c,3d',
					'esc_html__:1,2d',
					'esc_html_e:1,2d',
					'esc_html_x:1,2c,3d',
					'_n_noop:1,2,3d',
					'_nx_noop:1,2,3c,4d'
				]
			},
			files: {
				src: [ '**/*.php' ].concat( WPF2BR_EXCLUDED_MISC ),
				expand: true
			}
		},

		clean: {
			all: [ BUILD_DIR ]
		},

		copy: {
			files: {
				files: [
					{
						cwd: '',
						dest: 'build/',
						dot: true,
						expand: true,
						src: ['**', '!**/.{svn,git}/**'].concat( WPF2BR_EXCLUDED_MISC )
					}
				]
			}
		},

		jshint: {
			options: grunt.file.readJSON( '.jshintrc' ),
			grunt: {
				src: ['Gruntfile.js']
			}
		},

		makepot: {
			target: {
				options: {
					domainPath: '/languages',
					mainFile: 'wp-fail2ban-redux.php',
					potFilename: 'wp-fail2ban-redux.pot',
					potHeaders: {
						poedit: true,
						'x-poedit-keywordslist': true
					},
					type: 'wp-plugin',
					updateTimestamp: true,
					processPot: function( pot, options ) {
						pot.headers['report-msgid-bugs-to'] = 'https://github.com/thebrandonallen/wp-fail2ban-redux/issues';
						pot.headers['last-translator']      = 'BRANDON ALLEN <plugins@brandonallen.me>';
						pot.headers['language-team']        = 'ENGLISH <plugins@brandonallen.me>';
						pot.headers['language']             = 'en_US';
						var translation, // Exclude meta data from pot.
							excluded_meta = [
								'Plugin Name of the plugin/theme',
								'Plugin URI of the plugin/theme',
								'Author of the plugin/theme',
								'Author URI of the plugin/theme'
							];

						for ( translation in pot.translations[''] ) {
							if ( 'undefined' !== typeof pot.translations[''][ translation ].comments.extracted ) {
								if ( excluded_meta.indexOf( pot.translations[''][ translation ].comments.extracted ) >= 0 ) {
									console.log( 'Excluded meta: ' + pot.translations[''][ translation ].comments.extracted );
									delete pot.translations[''][ translation ];
								}
							}
						}

						return pot;
					}
				}
			}
		},

		'string-replace': {
			dev: {
				files: {
					'wp-fail2ban-redux.php': 'wp-fail2ban-redux.php'
				},
				options: {
					replacements: [{
						pattern: /(\* Version:\s*)(.*)$/gm, // For plugin header
						replacement: '$1<%= pkg.version %>'
					}]
				}
			},
			build: {
				files: {
					'wp-fail2ban-redux.php': 'wp-fail2ban-redux.php',
					'readme.txt': 'readme.txt'
				},
				options: {
					replacements: [{
						pattern: /(\* Version:\s*)(.*)$/gm, // For plugin header
						replacement: '$1<%= pkg.version %>'
					},
					{
						pattern: /(Stable tag:[\*\ ]*)(.*\S)/gim, // For readme.*
						replacement: '$1<%= pkg.version %>'
					}]
				}
			}
		},

		wp_readme_to_markdown: {
			your_target: {
				files: {
					'README.md': 'readme.txt'
				}
			}
		}
	} );

	// Register custom tasks.
	grunt.registerTask( 'i18n',   ['checktextdomain', 'makepot'] );
	grunt.registerTask( 'readme', ['wp_readme_to_markdown'] );
	grunt.registerTask( 'build',  [ 'clean:all', 'string-replace:build', 'readme', 'i18n', 'copy:files' ] );

	grunt.util.linefeed = '\n';
};
