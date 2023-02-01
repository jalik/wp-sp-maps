function MapFeature(props) {
  const { post } = props;
  return (
    <div>
      <a href={post.guid}>
        {post.post_title}
      </a>
    </div>
  );
}

export default MapFeature;
