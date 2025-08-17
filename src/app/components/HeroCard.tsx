"use client"
import Link from "next/link";
import Image from "next/image";
import isEmpty from 'lodash/isEmpty';
import { Button } from '@/app/components/button';
import {DESCRIPTION_SEPARATOR, SENTENCE_SEPARATOR} from '@/app/components/utils';
import { SpeakerWaveIcon } from "@heroicons/react/24/outline";

export interface HeroCardProps {
  imageSrcs?: string[];
  imageAlt: string;
  title?: string;
  description?: string;
  href: string;
  buttonContent?: string;
  // The memoryPiece will be masked if testMode is true.
  testMode?: boolean;
}

const hideKeyWord = (keyWord: string, content: string) => content.replaceAll(keyWord, '▢');

const ImageSize = 400;

const ImageMask = () => <div className="w-[400px] h-[400px] bg-muted rounded-lg animate-pulse"></div>



export function HeroCard(props: HeroCardProps) {
  const {imageSrcs, imageAlt, title, description, href, buttonContent, testMode} = props;
  const [wordCombinations, sentenceSamples] = description == null ? ['', ''] : description?.split(DESCRIPTION_SEPARATOR);
  const sentences = sentenceSamples?.split(SENTENCE_SEPARATOR);
    const handleRead = async (text: string) => {
    const res = await fetch("/api/read-text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    const audio = new Audio(data?.url);
    audio.play();
  };
  const ReadContentIcon = (content: string) => <SpeakerWaveIcon className="ml-2 size-6 flex-none rounded-lg bg-muted group-hover:bg-accent hover:cursor-pointer" onClick={() => handleRead(content)}/>
  return (
  <div className="w-full border-2 md:border-4 rounded-lg">
          <div className="m-2 md:m-4 flex flex-col md:flex-row items-center">
            {testMode ? <ImageMask /> : <Image
              src={imageSrcs?.[0] || ""}
              alt={imageAlt}
              width={ImageSize}
              height={ImageSize}
              className="w-full max-w-sm rounded-lg shadow-xl"
              priority
            />}
            <div className="m-2 md:items-baseline">
              <div className="flex flex-row items-center">
                <h1 className="text-5xl font-bold font-serif">{testMode ? hideKeyWord(title || '', title || '') : title}</h1>{ReadContentIcon(title||'')}
              </div>
              <div className="flex flex-row ml-2 pt-6">
              <p className="italic text-muted-foreground">{testMode ? hideKeyWord(title || '', wordCombinations) : wordCombinations}</p>
              {ReadContentIcon(wordCombinations||'')}
              </div>
              {sentences?.map((content: string) => 
                (<div key={content} className="flex flex-row ml-2 pt-2">
                <p className="italic text-muted-foreground">{`${testMode ? hideKeyWord(title || '', content) : content}`}</p>
                {ReadContentIcon(content||'')}
                </div>)
                )}
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