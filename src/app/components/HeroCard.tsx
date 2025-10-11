"use client"
import Link from "next/link";
import Image from "next/image";
import isEmpty from 'lodash/isEmpty';
import { Button } from '@/app/components/button';
import {DESCRIPTION_SEPARATOR, SENTENCE_SEPARATOR, handleRead} from '@/app/components/utils';
import { SpeakerWaveIcon, CheckIcon, XMarkIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { useCallback, useState } from "react";

export interface HeroCardProps {
  imageSrcs?: string[];
  imageAlt: string;
  title?: string;
  description?: string;
  href?: string;
  buttonContent?: string;
  // The memoryPiece will be masked if testMode is true.
  testMode?: boolean;
  correctHandler?: () => Promise<void>;
  wrongHandler?: () => Promise<void>;
  // Editor mode allows content management
  editorMode?: boolean;
  canManageContent?: boolean;
}

const hideKeyWord = (keyWord: string, content: string) => content.replaceAll(keyWord, '▢');

const ImageSize = 384;

const ImageMask = () => <div className="w-[400px] h-[400px] bg-muted rounded-lg animate-pulse"></div>

export function HeroCard(props: HeroCardProps) {
  const {imageSrcs, imageAlt, title, description, href, buttonContent, testMode, correctHandler, wrongHandler, editorMode, canManageContent} = props;
  const [wordCombinations, sentenceSamples] = description == null ? ['', ''] : description?.split(DESCRIPTION_SEPARATOR);
  const sentences = sentenceSamples?.split(SENTENCE_SEPARATOR);
  const [readyToSubmit, setReadyToSubmit] = useState<boolean>();
  const [regenerating, setRegenerating] = useState<Record<string, boolean>>({});

  const handleRegenerateAudio = useCallback(async (content: string) => {
    if (isEmpty(content)) return;

    setRegenerating(prev => ({ ...prev, [content]: true }));

    try {
      // 1. Delete existing audio
      await fetch('/api/audio/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content }),
      });

      // 2. Generate new audio
      const generateRes = await fetch('/api/audio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content }),
      });

      if (!generateRes.ok) {
        throw new Error('Failed to generate audio');
      }

      const { audio } = await generateRes.json();

      // 3. Save new audio
      const saveRes = await fetch('/api/audio/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content, audioBase64: audio }),
      });

      if (!saveRes.ok) {
        throw new Error('Failed to save audio');
      }

      alert('Audio regenerated successfully!');
    } catch (error) {
      console.error('Error regenerating audio:', error);
      alert('Failed to regenerate audio. Please try again.');
    } finally {
      setRegenerating(prev => ({ ...prev, [content]: false }));
    }
  }, []);

  const readContentIcon = useCallback((content: string) => {
    if (isEmpty(content)) return null;

    return (
      <div className="flex items-center gap-1">
        <SpeakerWaveIcon
          className="ml-2 size-6 flex-none rounded-lg bg-muted group-hover:bg-accent hover:cursor-pointer"
          onClick={() => handleRead(content)}
        />
        {editorMode && canManageContent && (
          <ArrowPathIcon
            className={`size-6 flex-none rounded-lg bg-muted hover:bg-blue-200 dark:hover:bg-blue-800 hover:cursor-pointer ${regenerating[content] ? 'animate-spin' : ''}`}
            onClick={() => handleRegenerateAudio(content)}
            title="Regenerate audio"
          />
        )}
      </div>
    );
  }, [editorMode, canManageContent, regenerating, handleRegenerateAudio]);

  const testButtons = !readyToSubmit ? <Button className="ml-4 mt-4 w-20 h-6" onClick={() => setReadyToSubmit(true)} >Ready</Button> : <div className="ml-4 mt-4 w-20 h-6 flex flex-row justify-between"><Button className="w-6 h-6 bg-green-300 dark:bg-green-700 hover:bg-green-400 dark:hover:bg-green-600" onClick={() => {setReadyToSubmit(false); correctHandler?.();}}><CheckIcon className="" /></Button><Button className="w-6 h-6 bg-red-300 dark:bg-red-700 hover:bg-red-400 dark:hover:bg-red-600" onClick={() => {setReadyToSubmit(false); wrongHandler?.()}}><XMarkIcon className="" /></Button></div>
  return (
  <div className="w-full border-2 md:border-4 rounded-lg">
          <div className="m-2 md:m-4 flex flex-col md:flex-row items-center">
            {testMode && !readyToSubmit ? <ImageMask /> : <Image
              src={imageSrcs?.[0] || ""}
              alt={imageAlt}
              width={ImageSize}
              height={ImageSize}
              className="w-full max-w-sm rounded-lg shadow-xl"
              priority
            />}
            <div className="m-2 md:items-baseline">
              <div className="flex flex-row items-center">
                <h1 className="text-5xl font-bold font-serif">{testMode && !readyToSubmit ? hideKeyWord(title || '', title || '') : title}</h1>{readContentIcon(title||'')}
              </div>
              <div className="flex flex-row ml-2 pt-6">
              <p className="italic text-muted-foreground">{testMode && !readyToSubmit ? hideKeyWord(title || '', wordCombinations) : wordCombinations}</p>
              {readContentIcon(wordCombinations||'')}
              </div>
              {sentences?.map((content: string) => 
                (<div key={content} className="flex flex-row ml-2 pt-2">
                <p className="italic text-muted-foreground">{`${testMode && !readyToSubmit ? hideKeyWord(title || '', content) : content}`}</p>
                {readContentIcon(content||'')}
                </div>)
                )}
              {
                testMode && testButtons
              }
              {!isEmpty(buttonContent) && <Link
                href={href || ''}
                className="btn-primary btn"
              >
                <Button>{buttonContent}</Button>
              </Link>}
            </div>
          </div>
        </div>
)
}