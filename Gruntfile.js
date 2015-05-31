module.exports = function (grunt) {

    //Initializing the configuration object
    grunt.initConfig({

        // get the configuration info from package.json ----------------------------
        // this way we can use things like name and version (pkg.name)
        pkg: grunt.file.readJSON('package.json'),

        // Task configuration
        concat: {
            options: {
                separator: '\n'
            },
            libs: {
                src: [
                    './bower_components/shifty/dist/shifty.min.js',
                    './bower_components/draw2d/dist/patched_raphael.js',
                    './bower_components/jquery/dist/jquery.min.js',
                    './bower_components/jquery-ui/jquery-ui.min.js',
                    './bower_components/bootstrap/dist/js/bootstrap.min.js',
                    './bower_components/draw2d/dist/jquery.autoresize.js',
                    './bower_components/draw2d/dist/jquery-touch_punch.js',
                    './bower_components/draw2d/dist/jquery.contextmenu.js',
                    './bower_components/draw2d/dist/rgbcolor.js',
                    './bower_components/draw2d/dist/patched_canvg.js',
                    './bower_components/draw2d/dist/patched_Class.js',
                    './bower_components/draw2d/dist/json2.js',
                    './bower_components/draw2d/dist/pathfinding-browser.min.js',
                    './bower_components/draw2d/dist/draw2d.js',
                    './bower_components/octokat/dist/octokat.js',
                    './bower_components/hogan/web/1.0.0/hogan.min.js'
                ],
                dest: './dist/assets/javascript/dependencies.js',
                nonull: true
            },
            css: {
                src: [
                ],
                dest: './dist/assets/stylesheets/dependencies.css',
                nonull: true
            },
            application: {
                src: [
                    './src/assets/javascript/colors.js',
                    './src/assets/javascript/util.js',
                    './src/assets/javascript/RubberConnection.js',
                    './src/assets/javascript/main.js'
                ],
                dest: './dist/assets/javascript/app.js',
                nonull: true
            }
        },

        copy: {
            application: {
                expand: true,
                cwd: 'src/',
                src: ['**/*.html', '**/*.png'],
                dest: 'dist/'
            },
            material:{
                expand: true,
                cwd: 'bower_components/bootstrap-material-design/dist/',
                src: ['**/*'],
                dest: './dist/lib/material'
            },
            bootstrap:{
                expand: true,
                cwd: 'bower_components/bootstrap/dist/',
                src: ['**/*'],
                dest: './dist/lib/bootstrap'
            }

        },
        less: {
            development: {
                options: {
                    compress: false
                },
                files: {
                    "./dist/assets/stylesheets/main.css": "./src/assets/less/main.less"
                }
            }
        },

        // configure jshint to validate js files -----------------------------------
        jshint: {
            options: {
                reporter: require('jshint-stylish') // use jshint-stylish to make our errors look and read good
            },

            // when this task is run, lint the Gruntfile and all js files in src
            build: ['Grunfile.js', 'src/**/*.js']
        },

        watch: {
            js: {
                files: [
                    './src/assets/javascript/**/*.js'
                ],
                tasks: ['concat:application'],
                options: {
                    livereload: true
                }
            },
            html: {
                files: [
                    "./src/assets/less/**/*.less"
                ],
                tasks: ['less'],
                options: {
                    livereload: true
                }
            },
            less: {
                files: [
                    "./src/**/*.html"
                ],
                tasks: ['copy'],
                options: {
                    livereload: true
                }
            }
        },
        'gh-pages': {
            options: {
                base: 'dist'
            },
            src: ['**']
        }
    });

    // Plugin loading
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-gh-pages');

    // Task definition
    grunt.registerTask('default', ['jshint', 'concat', 'less', 'copy']);
    grunt.registerTask('publish', ['jshint', 'concat', 'less', 'copy', 'gh-pages']);


};

