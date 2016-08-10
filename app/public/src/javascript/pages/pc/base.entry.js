// style -> base.css
require('css_path/common/pc/base.css');

//polyfill & shim
// es5
require('es5-shim');
require('es5-shim/es5-sham');
//console
require('console-polyfill');
// promise
require('es6-promise').polyfill();
// fetch
require('fetch-polyfill');
