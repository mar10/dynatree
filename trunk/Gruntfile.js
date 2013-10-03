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
        clean: {
          build: {
            noWrite: true,
            src: ["build"]
          }
        },
        compress: {
          build: {
            options: {
              archive: "dist/<%= pkg.name %>-<%= pkg.version %>.zip"
            },
            files: [
              {
                expand: true,
                cwd: "build/",
                src: ["**/*"],
                dest: ""
              }
            ]
          }
        },
        concat: {
            options: {
                stripBanners: true
            },
            build: {
                src: ["<banner:meta.banner>", 
                      "src/<%= pkg.name %>.js"
                      ],
                // dest: "build/<%= pkg.name %>-<%= pkg.version %>.js"
                dest: "build/<%= pkg.name %>.js"
            }
        },
        connect: {
            demo: {
                options: {
                    port: 8080,
                    base: "./",
                    keepalive: true
                }
            }
        },
        copy: {
          build: {
            files: [
              {
                expand: true,
                cwd: "src/",
                src: ["skin**/*.{css,gif,png}", "*.txt"],
                dest: "build/"
              }, {
                src: ["*.txt", "*.md"],
                dest: "build/"
              }
            ]
          }
        },
        exec: {
            tabfix: {
                // Cleanup whitespace according to http://contribute.jquery.org/style-guide/js/
                // (requires https://github.com/mar10/tabfix)
                // cmd: "tabfix -t --line=UNIX -r -m *.js,*.css,*.html,*json,*.yaml -i node_modules src doc -d"
                cmd: "tabfix -t -r -m*.js,*.css,*.html,*.json -inode_modules src doc"
            },
            upload: {
                // FTP upload the demo files (requires https://github.com/mar10/pyftpsync)
                // cmd: "pyftpsync --progress upload . ftp://www.wwwendt.de/tech/fancytree --delete-unmatched --omit build,node_modules,.*,_*  -x"
                cmd: "pyftpsync --progress upload . ftp://www.wwwendt.de/tech/demo/dynatree --delete-unmatched --omit dist,node_modules,.*,_*"
            }
        },
        jshint: {
            beforeConcat: ["Gruntfile.js", 
                           "src/jquery.dynatree.js", 
                           "tests/test-dynatree.js"],
            afterConcat: ["<config:concat.dist.dest>"],
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
                eqnull: true,
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
        },
        qunit: {
            // files: ["tests/unit/**/*.html"]
          build: ["test/unit/test-core-build.html"],
          develop: ["test/unit/test-core.html"]
        },
        replace: {
          build: {
            src: ["build/*.js"],
            overwrite: true,
            replacements: [
              {
                from: /version:\s*\"development\"/g,
                // from: /version:\s*\"[0-9\.\-]+\"/g,
                to: "version: \"<%= pkg.version %>\""
              }, {
                from: /(@version:?\s*)(DEVELOPMENT)(\s*)/g,
                to: "$1<%= pkg.version %>$3"
              }, {
                from: /(@date:?\s*)(DEVELOPMENT)(\s*)/g,
                to: "$1<%= grunt.template.today('yyyy-mm-dd\"T\"HH:MM') %>$3"
              }, {
                from: /buildType:\s*\"[a-zA-Z]+\"/g,
                to: "buildType: \"release\""
              }, {
                from: /debugLevel:\s*[0-9]/g,
                to: "debugLevel: 1"
              }
            ]
          }
        },
        uglify: {
            build: {
                options: {
                    banner: "<%= meta.banner %>"
                },
                files: {
                    "build/<%= pkg.name %>.min.js": ["<%= concat.build.dest %>"]
                }
            }
        }
    });
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-compress");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-connect");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    // grunt.loadNpmTasks("grunt-contrib-qunit");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-exec");
    grunt.loadNpmTasks("grunt-text-replace");

    grunt.registerTask("server", ["connect:demo"]);
    grunt.registerTask("test", [
        "jshint:beforeConcat"
        // "qunit:develop"
        ]);
    // grunt.registerTask("travis", ["test"]);
    grunt.registerTask("default", ["test"]);
    grunt.registerTask("build", [
        "exec:tabfix", 
        "test", 
        "clean:build", 
        "copy:build", 
        "concat:build", 
        "replace:build", 
        "uglify:build",
        "jshint:afterConcat", 
        "uglify", 
        // "qunit:build",
        "compress:build"
        // "clean:build"
        ]);
    // grunt.registerTask("release", ["checkrepo:beforeRelease", "build", "tagrelease", "bumpup:prerelease"]);
    grunt.registerTask("upload", ["build", "exec:upload"]);
};
