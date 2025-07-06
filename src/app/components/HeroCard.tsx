import Link from "next/link";
import Image from "next/image";
import isEmpty from 'lodash/isEmpty';
import { Button } from '@/app/components/button';

export interface HeroCardProps {
  imageSrcs?: string[];
  imageAlt: string;
  title?: string;
  description?: string;
  href: string;
  buttonContent?: string
}

export function HeroCard(props: HeroCardProps) {
  const {imageSrcs, imageAlt, title, description, href, buttonContent} = props;
  const [wordCombinations, sentenceSamples] = description?.split("##");
  return (
  <div className="w-full border-2 md:border-4 rounded-lg">
          <div className="m-2 md:m-4 flex flex-col md:flex-row items-center">
            <Image
              src={imageSrcs?.[0] || ""}
              alt={imageAlt}
              width={400}
              height={800}
              className="w-full max-w-sm rounded-lg shadow-xl"
              priority
            />
            <div className="m-2 md:items-baseline">
              <h1 className="text-5xl font-bold font-serif">{title}</h1>
              <p className="ml-2 pt-6 italic text-muted-foreground">{wordCombinations}</p>
              <p className="ml-2 pt-2 italic text-muted-foreground">{sentenceSamples}</p>
              {!isEmpty(buttonContent) && <Link
                href={href}
                className="btn-primary btn"
              >
                <Button>{buttonContent}</Button>
              </Link>}
            </div>
          </div>
        </div>
)
}