module.exports = function(grunt)
{
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-coffee');
    grunt.loadNpmTasks('grunt-shell');

    grunt.initConfig({
        shell : {
            _options : { failOnError: true },

            clean         : { command : 'rm -fr ./build/**; mkdir ./build; mkdir ./build/vendor' },
            spec          : { command : 'jasmine-node --coffee spec/' },
            specserver    : { command : 'static -c none -p 8000 ./spec & open "http://localhost:8000"' },

            diff_resistance    : { command : 'diff -u ./vendor/resistance/lib/resistance.js ./build/vendor/resistance.js > vendor/_patches/resistance.js.patch' },
            diff_watchjs       : { command : 'diff -u ./vendor/watchjs/src/watch.js ./build/vendor/watch.js > vendor/_patches/watch.js.patch' },

            patch_resistance    : { command : 'patch -p1 -t --output=build/vendor/resistance.js vendor/resistance/lib/resistance.js vendor/_patches/resistance.js.patch' },
            patch_watchjs       : { command : 'patch -p1 -t --output=build/vendor/watch.js vendor/watchjs/src/watch.js vendor/_patches/watch.js.patch' },
        },

        less : {
            styles : {
                options : {
                    paths    : [ 'src/less' ],
                    compress : true
                },
                files : {
                    'build/css/textext.itemmanager.ajax.css'    : 'src/less/textext.itemmanager.ajax.less',
                    'build/css/textext.css'                     : 'src/less/textext.less',
                    'build/css/textext.plugin.arrow.css'        : 'src/less/textext.plugin.arrow.less',
                    'build/css/textext.plugin.autocomplete.css' : 'src/less/textext.plugin.autocomplete.less',
                    'build/css/textext.plugin.focus.css'        : 'src/less/textext.plugin.focus.less',
                    'build/css/textext.plugin.prompt.css'       : 'src/less/textext.plugin.prompt.less',
                    'build/css/textext.plugin.tags.css'         : 'src/less/textext.plugin.tags.less'
                }
            }
        },

        coffee : {
            compile : {
                src     : [ 'src/**/*.coffee' ],
                dest    : 'build',
                options : {
                    bare          : true,
                    preserve_dirs : false,
                    base_path     : 'build'
                }
            }
        },

        copy : {
            all : {
                files : {
                    'build/images/' : 'src/images/**'
                }
            }
        },

        watch: {
            coffee : {
                files : '<config:coffee.compile.src>',
                tasks : [ 'coffee' ]
            },
            less : {
                files : ['src/less/*.less'],
                tasks : ['less']
            }
        }
    });

    grunt.registerTask('vendor:diff', 'shell:diff_eventemitter2 shell:diff_resistance shell:diff_watchjs')
    grunt.registerTask('vendor:patch', 'shell:patch_watchjs shell:patch_resistance');
    grunt.registerTask('build', 'shell:clean less copy vendor:patch coffee');
    grunt.registerTask('spec', 'build shell:specserver');
    grunt.registerTask('default', 'build');
}
