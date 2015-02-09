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

    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: '<%= concat.dist.dest %>',
        dest: 'dist/<%= pkg.name %>.min.js'
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
    }

  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-connect');

  // Default task.
  grunt.registerTask('default', ['clean', 'uglify']);
};
