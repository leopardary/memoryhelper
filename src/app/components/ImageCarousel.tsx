import Image from "next/image";

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
        width={400}
        height={800}
        className="w-full" />
      {imageSrcs.length > 1 && (<div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between">
        <a href={`#slide${prevIndex}`} className="btn btn-circle">❮</a>
        <a href={`#slide${nextIndex}`} className="btn btn-circle">❯</a>
      </div>)}
    </div>)
  })}
  </div>
  )
};

export default ImageCarousel;