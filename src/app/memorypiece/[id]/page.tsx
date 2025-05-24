import Breadcrumbs from "@/app/components/Breadcrumbs"
import { parentUnitChain } from "@/lib/db/api/unit" 
import { getMemoryPiece } from '@/lib/db/api/memory-piece'
import {HeroCard} from '@/app/components/HeroCard'

function getSubjectTitle(memoryPiece: any) {
  return memoryPiece?.subject.title;
}

export default async function MemoryPiece({params}: {params: Promise<{id: string}>}) {
  const { id } = await params;
  const memoryPieceId = id;
  const memoryPiece = await getMemoryPiece(memoryPieceId);
  if (!memoryPiece) throw new Error(`memoryPiece not found.`);
  // get all the units from the memoryPiece's unit upto the root unit.
  const unitChain = memoryPiece?.unit && await parentUnitChain(memoryPiece.unit.id.toString());
  const breadcrumbsSegments = unitChain?.reverse().map(unit => {return {name: unit.title, url: `/unit/${unit.id}`};}) || [];
  // append with the current memoryPiece.
  breadcrumbsSegments.push({name: memoryPiece.content, url: `/memorypiece/${memoryPiece.id}`});
  // prefix with the subject.
  breadcrumbsSegments.unshift({name: getSubjectTitle(memoryPiece), url: `/subject/${memoryPiece?.subject.id}`});

  return <>
  <Breadcrumbs segments={breadcrumbsSegments}/>
  <div className="flex flex-col items-center">
  <HeroCard imageSrcs={memoryPiece.imageUrls} imageAlt={memoryPiece.content} title={memoryPiece.content} description={memoryPiece.description} href={`/memorypiece/${memoryPiece.id}`} />
  </div>
  </>
}