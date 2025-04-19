import Link from "next/link";

interface PathSegmentProps {
  url: string;
  name: string;
}

const PathSegment = (props: PathSegmentProps) => (<li>
  <Link href={props?.url}>
    <svg
      fill="none"
      viewBox="0 0 24 24"
      className="h-4 w-4 stroke-current">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
    </svg>
    {props?.name}
  </Link>
</li>)

export interface BreadcumbsProps {
  segments: PathSegmentProps[]
}

export default function Breadcrumbs(props: BreadcumbsProps) {
  return (
    <div className="breadcrumbs text-sm">
  <ul>
    {props && props.segments.map((segment: PathSegmentProps) => {
      return (<PathSegment key={segment.url} url={segment.url} name={segment.name} />);
      })}
  </ul>
</div>
  );
}
