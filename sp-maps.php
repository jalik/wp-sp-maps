<?php

/*
Plugin Name: Maps
Plugin URI:
Description: Display posts on a map.
Version: 1.0.0
Author: SIGMA POLYNESIA (Karl STEIN)
Author URI: https://www.sigmapolynesia.com
License: MIT
*/

defined('ABSPATH') || die();

define('SPMAPS_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('SPMAPS_PLUGIN_FILE', __FILE__);

include_once 'include/functions.php';
include_once 'include/metaboxes.php';
include_once 'include/shortcodes.php';
include_once 'include/taxonomies.php';
