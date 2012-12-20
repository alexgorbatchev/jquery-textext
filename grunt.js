module.exports = function(grunt)
{
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-coffee');
    grunt.loadNpmTasks('grunt-shell');

    grunt.initConfig({
        shell : {
            clean      : { command : 'rm -fr ./build/**; mkdir ./build' },
            spec       : { command : 'jasmine-node --coffee spec/' },
            specserver : { command : 'nserver --directory spec & open "http://localhost:8000"' }
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
            less: {
                files: ['src/less/*.less'],
                tasks: ['less']
            }
        }
    });

    grunt.registerTask('default', 'shell:clean less copy coffee shell:spec');
    grunt.registerTask('spec', 'shell:specserver');
}
