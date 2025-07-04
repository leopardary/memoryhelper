import Link from "next/link";
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/20/solid'

interface PathSegmentProps {
  url: string;
  name: string;
}

const PathSegment = (props: PathSegmentProps) => (<li>
  <Link href={props?.url} className={`${props.name == 'Home' ? 'inline-flex' : 'flex'} items-center`}>
  {props.name == 'Home' ? <HomeIcon className="size-4 fill-muted-foreground mr-1"/> :
    <ChevronRightIcon className="size-4 fill-muted-foreground mr-1"/>}
    {props?.name}
  </Link>
</li>)

export interface BreadcumbsProps {
  segments: PathSegmentProps[]
}

export default function Breadcrumbs(props: BreadcumbsProps) {
  return (
    <nav className="flex px-5 py-3 text-gray-700 border border-gray-200 rounded-lg bg-background dark:text-gray-200 dark:border-gray-700" aria-label="Breadcrumb">
  <ol className="inline-flex items-center space-x-1 rtl:space-x-reverse">
    {props && props.segments.map((segment: PathSegmentProps) => {
      return (<PathSegment key={segment.url} url={segment.url} name={segment.name} />);
      })}
  </ol>
</nav>
  );
}
