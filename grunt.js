module.exports = function(grunt)
{
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-less');

    grunt.initConfig({
        less: {
            development: {
                options: {
                    yuicompress: false
                },
                files: {
                    "src/css/*.css": "src/less/*.less"
                }
            }
        },
        watch: {
            gruntfile: {
                files: 'grunt.js',
                tasks: ['jshint:gruntfile'],
                options: {
                    nocase: true
                }
            },
            less: {
                files: ['src/less/*.less'],
                tasks: ['less']
            }
        }
    });

    // grunt.registerTask('watch', 'watch');
};