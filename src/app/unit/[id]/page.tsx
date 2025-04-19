import Breadcrumbs from "@/app/components/Breadcrumbs"
import { getUnit, parentUnitChain } from "@/lib/db/api/unit" 
import UnitCard from "@/app/components/UnitCard"
import MemoryPieceCard from '@/app/components/MemoryPieceCard'
import {UnitProps} from '@/lib/db/model/types/Unit.types'
import {MemoryPieceProps} from '@/lib/db/model/types/MemoryPiece.types'
import isEmpty from 'lodash/isEmpty'

// A unit is either having children units when it is a organizing unit, or having children memoryPieces when it is a leaf unit.
export default async function Unit({params}) {
  const unitId = params.id;
  const unit = await getUnit(unitId);
  if (!unit) throw new Error(`unit not found.`);
  // get all the units from current unit's parent upto the root unit.
  const unitChain = unit?.parentUnit && await parentUnitChain(unit.parentUnit.id);
  const breadcrumbsSegments = unitChain?.reverse().map(unit => {return {name: unit.title, url: `/unit/${unit.id}`};}) || [];
  // append with the current unit.
  breadcrumbsSegments.push({name: unit.title, url: `/unit/${unit.id}`});
  // prefix with the subject.
  breadcrumbsSegments.unshift({name: unit?.subject.title, url: `/subject/${unit?.subject.id}`});
  const unitChildren = unit?.children;
  const memoryPieces = unit?.memoryPieces;
  // const childUnits = unit?.children;
  // const subject = await getSubject(subjectId);
  // const breadcrumbs = [{url: `/subject/${subjectId}`, name: subject?.title}]
  return <>
  <Breadcrumbs segments={breadcrumbsSegments}/>
  <div className="flex flex-col items-center">
  <div className="my-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {!isEmpty(unitChildren) ? unitChildren.map((unitChild: UnitProps) => (
          <UnitCard unit={unitChild} key={unitChild.id} />
        )) : 
        memoryPieces.map((memoryPiece: MemoryPieceProps) => (
          <MemoryPieceCard memoryPiece={memoryPiece} key={memoryPiece.id}/>
        ))}
      </div>
  </div>
  </>
}
