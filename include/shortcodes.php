<?php

function spmaps_map_shortcode($atts = array(), $content = null, $tag = '')
{
  $opts = array_change_key_case(shortcode_atts(
    array(
      'category' => null,
      'post' => null,
      'orderby' => 'title',
      'order' => 'ASC',
      'width' => '100%',
      'height' => '50vh',
      'showlist' => false,
    ), $atts, $tag
  ));

  $tagId = 'app-' . uniqid();

  // Get posts.
  $query = new WP_Query(array(
    'nopaging' => true,
    'post_type' => 'any',
    'name' => $opts['post'],
    'category_name' => $opts['category'],
    'orderby' => $opts['orderby'],
    'order' => $opts['order']
  ));

  $posts = array();

  foreach ($query->posts as $post) {
    $metas = spmaps_get_metas($post);

    if (!empty($metas['latitude']) && !empty($metas['longitude'])) {
      $post->metas = $metas;
      $posts[] = $post;
    }
  }

  spmaps_enqueue_styles();
  spmaps_enqueue_scripts('spmaps', array(
    'tagId' => $tagId,
    'options' => array_merge(array('posts' => $posts), $opts),
  ));

  ob_start();

  print "
  <div class='spmaps-map-container'>
    <div id='$tagId' class='spmaps-map' style='width: $opts[width]; height: $opts[height];'></div>
  </div>";

  return ob_get_clean();
}

add_shortcode('spmaps_map', 'spmaps_map_shortcode');
