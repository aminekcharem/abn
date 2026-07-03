import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

type FontAwesomeBrandIconProps = {
  className?: string;
  icon: IconDefinition;
};

export function FontAwesomeBrandIcon({
  className,
  icon,
}: FontAwesomeBrandIconProps) {
  const [width, height, , , pathData] = icon.icon;

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="currentColor"
      viewBox={`0 0 ${width} ${height}`}
    >
      {Array.isArray(pathData) ? (
        pathData.map((path, index) => <path d={path} key={index} />)
      ) : (
        <path d={pathData} />
      )}
    </svg>
  );
}
