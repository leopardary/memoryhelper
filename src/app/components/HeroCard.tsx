import Link from "next/link";
import Image from "next/image";
import isEmpty from 'lodash/isEmpty'

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
  return (
  <div className="hero rounded-xl bg-base-200 border-2">
          <div className="hero-content flex-col lg:flex-row">
            <Image
              src={imageSrcs?.[0] || ""}
              alt={imageAlt}
              width={400}
              height={800}
              className="w-full max-w-sm rounded-lg shadow-2xl"
              priority
            />
            <div>
              <h1 className="text-5xl font-bold">{title}</h1>
              <p className="py-6">{description}</p>
              {!isEmpty(buttonContent) && <Link
                href={href}
                className="btn-primary btn"
              >
                {buttonContent}
              </Link>}
            </div>
          </div>
        </div>
)
}