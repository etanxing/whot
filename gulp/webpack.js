'use strict';

import path from 'path';
import gulpif from 'gulp-if';
import webpack_stream from 'webpack-stream';
import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

const AUTOPREFIXER_BROWSERS = [
  'Android 2.3',
  'Android >= 4',
  'Chrome >= 35',
  'Firefox >= 31',
  'Explorer >= 9',
  'iOS >= 7',
  'Opera >= 12',
  'Safari >= 7.1',
];

export default function(gulp, plugins, args, config, taskTarget, browserSync) {
  console.log('args', args);
  const dirs = config.directories;
  const entries = config.entries;
  const DEBUG = !!!args.production;
  const VERBOSE = !!!args.verbose;
  const webpack_config = {
    watch: args._.length === 1 ? (args._[0] === 'serve') :false,
    debug: DEBUG,
    devtool: DEBUG ? 'cheap-module-eval-source-map' : false,
    output: {
      filename: 'script.js'
    },
    module: {
      loaders: [{
        test: /\.jsx?$/,
        loader: 'babel', // 'babel-loader' is also a legal name to reference
        query: {
          presets: ['es2015']
        }
      }, {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract('style', ['css', 'postcss', 'sass'].join('!'))
      }]
    },
    plugins: [
      new ExtractTextPlugin('styles.css'),
      new webpack.optimize.OccurenceOrderPlugin(),
      ...(DEBUG ? [] : [
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin({
          compress: {
            warnings: VERBOSE,
          },
        }),
        new webpack.optimize.AggressiveMergingPlugin(),
      ]),
    ],
    postcss: function plugins(bundler) {
      return [
        require('postcss-import')({ addDependencyTo: bundler }),
        require('autoprefixer')({
          browsers: AUTOPREFIXER_BROWSERS,
        }),
      ];
    },
  };

  // Browserify Task
  gulp.task('webpack', () => {
    return gulp.src('./' + path.join(dirs.source, entries.js))
      .pipe(webpack_stream(webpack_config))
      .pipe(gulp.dest(taskTarget + '/assets'));
  });
}
