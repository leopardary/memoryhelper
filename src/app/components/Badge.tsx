interface BadgeProps {
  text: string;
}

export default function Badge(props: BadgeProps) {
  const {text} = props;
  return (<span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-primary ring-1 ring-muted-foreground ring-inset">{text}</span>)
}