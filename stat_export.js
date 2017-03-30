#!/usr/bin/env node
/**
 *
 * Export KPI's
 *
 * Copyright (c) 2017 InterDigital, Inc. All Rights Reserved
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

process.HEADLESS = true;
if (!process.env.BIPIO_BASE_DIR) {
  console.log('BIPIO_BASE_DIR environment variable not set');
  process.exit(0);
}

function toUTC(date) {
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
};

function nowUTCSeconds() {
  var d = toUTC(new Date());
  return d.getTime();
}

var bootstrap = require(process.env.BIPIO_BASE_DIR + '/src/bootstrap'),
  dao = bootstrap.app.dao,
  now = nowUTCSeconds() / 1000,
  then = now - (60 *60 * 24);

dao.on('ready', function(dao) {
  // get # users created in last day
  dao.findFilter(
    'account',
    {
      created : {
        '$gt' : then
      }
    },
    function(err, results) {
      if (err) {
        console.error(err);
        process.exit();
      } else {
        for (var i = 0; i < results.length; i++) {
          (function(account) {
            dao.list('bip', undefined, 1, 1, [ 'created', 'asc' ], { owner_id : account.id }, function(err, modelName, results) {
              if (err) {
                console.error(err);
              } else if (results.data && results.data.length) {
                console.log(account.username + ' SUCCESS 1 of ' + results.total + ' took ' + ( Math.floor( (results.data[0].created / 1000) - account.created) / 60) + ' minutes');
              } else {
                console.log(account.username + ' no bip after ' + (now - account.created) + 'seconds');
              }
            });
          })(results[i]);
        }
      }
    }
  );
});
