'use strict';

module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    banner: '/**\n * <%= pkg.name %> - v<%= pkg.version %> ' + '(<%= grunt.template.today("yyyy-mm-dd") %>)\n' +
                ' * <%= pkg.homepage  %>\n' +
                ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +' Licensed <%= pkg.license %> \n */\n',

    clean: {
      files: ['dist']
    },

    concat: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: ['src/grant.js'],
        dest: 'dist/angular-ui-router-grant.js',
      },
    },

    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: 'src/*.js',
        dest: 'dist/angular-ui-router-grant.min.js'
      },
    },

    connect: {
      server: {
        options: {
          hostname: 'localhost',
          port: 9000,
          base: ['demo', 'src'],
          keepalive : true,
          open: true
        }
      }
    },

    concurrent: {
      options: {
        logConcurrentOutput: true
      },
      tasks: ['karma:unit', 'connect']
    },

    karma: {
      options: {
        files: [
          'https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.3.12/angular.min.js',
          'https://cdnjs.cloudflare.com/ajax/libs/angular-ui-router/0.2.13/angular-ui-router.min.js',
          'https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.3.12/angular-mocks.js',
          'src/grant.js',
          'test/*.spec.js'
        ],
        client: {
          captureConsole: true
        },
        frameworks: ['mocha', 'chai', 'chai-as-promised', 'sinon-chai'],
        reporters: ['mocha'],
        browsers: ['Chrome'],
        autoWatch: false,
        singleRun: true,
        colors: true
      },
      unit: {
        autoWatch: true,
        singleRun: false
      },
      unit_single: {
        autoWatch: false,
        singleRun: true
      },
      unit_coverage: {
        reporters: ['mocha', 'coverage'],
        preprocessors: {
          'src/grant.js': ['coverage']
        },
        coverageReporter: {
          type : 'html',
          dir : 'coverage',
          subdir: function(browser) {
            // normalization process to keep a consistent browser name accross different OS
            // e.g. for chrome would be coverage/chrome
            return browser.toLowerCase().split(/[ /-]/)[0];
          }
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-contrib-concat');

  // Default task.
  grunt.registerTask('default', ['concurrent']);

  grunt.registerTask('build', ['clean', 'concat', 'uglify']);
};
