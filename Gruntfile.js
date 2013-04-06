/*jshint node:true */

module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        // Project metadata, used by the <banner> directive.
        meta: {
            banner: "/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - " +
                    "<%= grunt.template.today('yyyy-mm-dd') %>\n" +
                    "<%= pkg.homepage ? '* ' + pkg.homepage + '\\n' : '' %>" +
                    "* Copyright (c) <%= grunt.template.today('yyyy') %> <%= pkg.author.name %>;" +
                    " Licensed <%= _.pluck(pkg.licenses, 'type').join(', ') %> */"
        },
        concat: {
            options: {
                stripBanners: true
            },
            dist: {
                src: ["<banner:meta.banner>", 
                      "src/<%= pkg.name %>.js"
                      ],
                dest: "dist/<%= pkg.name %>-<%= pkg.version %>.js"
            }
        },
        uglify: {
            dist: {
                options: {
                    banner: "<%= meta.banner %>"
                },
                files: {
                    "dist/<%= pkg.name %>.min.js": ["<%= concat.dist.dest %>"]
                }
            }
        },
//        qunit: {
//            files: ["tests/unit/**/*.html"]
//        },
        jshint: {
            beforeconcat: ["Gruntfile.js", 
                           "src/jquery.dynatree.js", 
                           "tests/test-dynatree.js"],
            afterconcat: ["<config:concat.dist.dest>"],
            options: {
                // Enforcing Options:
                bitwise: true,
                curly: true,
//              forin: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
//              noempty: true,
                nonew: true,
//              plusplus: true,
                regexp: true,
//              strict: true,
                sub: true,
                undef: true,
                // Relaxing Options:
                eqnull: false,
                laxbreak: true,
//                laxcomma: true,
                smarttabs: true,
//                globalstrict: true,
                // Environments:
                browser: true,
                globals: {
                    "define": false,
                    "jQuery": false
                }
            }
        }
//      watch: {
//          files: "<config:lint.files>",
//          tasks: "lint qunit"
//      },        
    });
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-uglify");
//  grunt.loadNpmTasks("grunt-contrib-qunit");

    grunt.registerTask("default", ["jshint:beforeconcat", 
                                   "concat", 
                                   "jshint:afterconcat", 
                                   "uglify"]);
//  grunt.registerTask("build", ["default"]);
//  grunt.registerTask("ci", ["jshint", "qunit"]);
};
