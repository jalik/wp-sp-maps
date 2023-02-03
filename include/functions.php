<?php

function spmaps_enqueue_scripts($const = 'spmaps', $vars = array())
{
  $plugin = plugin_basename(SPMAPS_PLUGIN_FILE);
  $version = WP_DEBUG ? time() : '1.0.1';
  wp_register_script('spmaps-scripts', plugins_url('build/index.js', $plugin), array('wp-element'), $version, true);
  wp_enqueue_script('spmaps-scripts');

  $encoded_value = json_encode($vars);
  wp_add_inline_script('spmaps-scripts', "$const = $encoded_value;", 'before');
}

function spmaps_enqueue_styles()
{
  $plugin = plugin_basename(SPMAPS_PLUGIN_FILE);
  $version = WP_DEBUG ? time() : '1.0.1';
  wp_enqueue_style('spmaps-styles', plugins_url('styles.css', $plugin), array(), $version);
  wp_enqueue_style('spmaps-ol', plugins_url('build/index.css', $plugin), array(), $version);
}
