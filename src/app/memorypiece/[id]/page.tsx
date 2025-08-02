import Breadcrumbs from "@/app/components/Breadcrumbs"
import { parentUnitChain } from "@/lib/db/api/unit"
import { getSubject } from "@/lib/db/api/subject"
import { getMemoryPiece } from '@/lib/db/api/memory-piece'
import {HeroCard} from '@/app/components/HeroCard'

const renderUnit = async (unit: any) => {
    const unitChain = await parentUnitChain(unit.id.toString());
    const breadcrumbsSegments = unitChain?.reverse().map(unit => {return {name: unit.title, url: `/unit/${unit.id.toString()}`};}) || [];
    const subject = await getSubject(unit.subject._id.toString());
    if (subject?.title == null) {
      return <></>;
    }
    breadcrumbsSegments.unshift({name: subject.title, url: `/subject/${subject.id.toString()}`});
    
    return (
      <div key={unit.id} className="space-y-2">
        <Breadcrumbs segments={breadcrumbsSegments}/>
      </div>
    );
};

export default async function MemoryPiece({params}: {params: Promise<{id: string}>}) {
  const { id } = await params;
  const memoryPieceId = id;
  const memoryPiece = await getMemoryPiece(memoryPieceId);
  if (!memoryPiece) throw new Error(`memoryPiece not found.`);

  return <>
  {/* <Breadcrumbs segments={breadcrumbsSegments}/> */}
  <div className="flex flex-col items-center">
    <HeroCard imageSrcs={memoryPiece.imageUrls} imageAlt={memoryPiece.content} title={memoryPiece.content} description={memoryPiece.description} href={`/memorypiece/${memoryPiece.id}`} />
  </div>
  <div>
    <h2 className="text-2xl font-bold mt-6">Related Units</h2>
    <div className="space-y-4">
      {memoryPiece.units?.map(unit => renderUnit(unit))}
    </div>
  </div>
  </>
}