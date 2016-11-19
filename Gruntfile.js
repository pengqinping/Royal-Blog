module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            main: {
                src: 'js/hux-blog.js',
                dest: 'js/hux-blog.min.js'
            }
        },
        less: {
            expanded: {
                options: {
                    paths: ["css"]
                },
                files: {
                    // general less/hux-blog.less to css/hux-blog.css file.
                    "css/hux-blog.css": "less/hux-blog.less"
                }
            },
            minified: {
                options: {
                    paths: ["css"],
                    cleancss: true,
                    compress: true //去掉空格和换行
                },
                files: {
                    "css/hux-blog.min.css": "less/hux-blog.less"
                }
            }
        },
        //添加编译文件顶部注释
        banner: '/*!\n' +
            ' * <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n' +
            ' * Copyright <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
            ' */\n',
        usebanner: {
            dist: {
                options: {
                    position: 'top',
                    banner: '<%= banner %>'
                },
                files: {
                    src: ['css/hux-blog.css', 'css/hux-blog.min.css', 'js/hux-blog.min.js']
                }
            }
        },
        watch: {
            scripts: {
                files: ['js/hux-blog.js'],
                tasks: ['uglify'],
                options: {
                    spawn: false,
                },
            },
            less: {
                files: ['less/*.less'],
                tasks: ['less'],
                options: {
                    spawn: false,
                }
            },
        },
    });

    // Load the plugins.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-banner');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Default task(s).
    grunt.registerTask('default', ['uglify', 'less', 'usebanner']);
    grunt.registerTask('lessMinicss','less:minified');

};
