<?php

function spmaps_get_meta_keys()
{
  return array(
    'latitude',
    'longitude',
    'zoom',
    'icon_color',
  );
}

function spmaps_get_metas($post)
{
  $metas = array();
  $keys = spmaps_get_meta_keys();

  foreach ($keys as $key) {
    $metas[$key] = get_post_meta($post->ID, $key, true);
  }
  return $metas;
}

function spmaps_metabox($post)
{
  $tagId = 'app-' . uniqid();
  $post->metas = spmaps_get_metas($post);

  $fields = array(
    'latitude' => array(
      'id' => 'meta_latitude',
      'label' => __('Latitude', 'spmaps'),
      'value' => get_post_meta($post->ID, 'latitude', true)
    ),
    'longitude' => array(
      'id' => 'meta_longitude',
      'label' => __('Longitude', 'spmaps'),
      'value' => get_post_meta($post->ID, 'longitude', true)
    ),
    'zoom' => array(
      'id' => 'meta_zoom',
      'label' => __('Zoom', 'spmaps'),
      'value' => get_post_meta($post->ID, 'zoom', true)
    ),
//    'icon_color' => array(
//      'id' => 'meta_icon_color',
//      'label' => __('Couleur de l\'icône', 'spmaps'),
//      'value' => get_post_meta($post->ID, 'icon_color', true)
//    ),
  );

  spmaps_enqueue_styles();
  spmaps_enqueue_scripts('spmaps', array(
    'tagId' => $tagId,
    'options' => array(
      'fields' => $fields,
      'post' => $post,
    ),
  ));

  echo "
  <div class='spmaps-map-metabox'>
    <div>";

  // todo button to delete location

  foreach ($fields as $name => $field) {
    $field_id = $field['id'];
    echo "
      <p>
        <label for='$field_id'>$field[label] :</label>
        <input id='$field_id' type='text' name='$name' value='" . sanitize_text_field($field['value']) . "' />
      </p>";
  }
  echo "
    </div>
    <div class='spmaps-map-container' style='height: 400px;'>
      <div id='$tagId' class='spmaps-map'></div>
    </div>
  </div>";
}

function spmaps_metaboxes_setup()
{
  add_meta_box(
    'map_location',
    __('Emplacement', 'spmaps'),
    'spmaps_metabox',
    null,
    'normal'
  );
}

add_action('add_meta_boxes', 'spmaps_metaboxes_setup');

function spmaps_save_metabox($postId)
{
  $metas = spmaps_get_meta_keys();

  foreach ($metas as $key) {
    if (isset($_POST[$key])) {
      update_post_meta($postId, $key, sanitize_text_field($_POST[$key]));
    }
  }
}

add_action('save_post', 'spmaps_save_metabox');
