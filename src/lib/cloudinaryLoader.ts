export default function cloudinaryLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  return `${src}?w=${width}&q=${quality || 75}&f_auto&c_limit`;
}
