import Link from "next/link";
import Image from "next/image";
import isEmpty from 'lodash/isEmpty'

export interface HeroCardProps {
  imageSrcs?: string[];
  imageAlt?: string;
  title?: string;
  description?: string;
  href?: string;
  buttonContent?: string
}

const ImageCarousel = ({imageSrcs, imageAlt}: {imageSrcs: string[], imageAlt: string}) => {
  return (<div className="carousel w-full">
    {imageSrcs.map((imageSrc: string, index: number) => {
      const prevIndex = index == 0 ? imageSrcs.length - 1 : index - 1;
      const nextIndex = index == imageSrcs.length - 1 ? 0 : index + 1; 
      return (
      <div key={`slide${index}`} id={`slide${index}`} className="carousel-item relative w-full">
      <Image
        src={imageSrc || ''}
        alt={imageAlt || ''}
        className="w-full" />
      <div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between">
        <a href={`#slide${prevIndex}`} className="btn btn-circle">❮</a>
        <a href={`#slide${nextIndex}`} className="btn btn-circle">❯</a>
      </div>
    </div>)
  })}
  </div>
  )
}

export function HeroCard(props: HeroCardProps) {
  const {imageSrcs, imageAlt, title, description, href, buttonContent} = props;
  return (
  <div className="hero rounded-xl bg-base-200 border-2">
          <div className="hero-content flex-col lg:flex-row">
            <ImageCarousel imageSrcs={imageSrcs} imageAlt={imageAlt} />
            {/* <Image
              src={imageSrc || ""}
              alt={imageAlt}
              width={400}
              height={800}
              className="w-full max-w-sm rounded-lg shadow-2xl"
              priority
            /> */}
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