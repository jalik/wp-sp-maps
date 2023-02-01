<?php

function spmaps_register_taxonomies()
{
  register_taxonomy_for_object_type('category', 'page');
}

add_action('init', 'spmaps_register_taxonomies');
