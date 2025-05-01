import Breadcrumbs from "@/app/components/Breadcrumbs"
import { getUnit, parentUnitChain } from "@/lib/db/api/unit" 
import UnitCard from "@/app/components/UnitCard"
import {UnitProps} from '@/lib/db/model/types/Unit.types'
import isEmpty from 'lodash/isEmpty'
import Table from '@/app/components/Table'
import SubscribeButton from '@/app/components/SubscribeButton'
import { findOrCreateSubscriptionsInBatch } from "@/lib/db/api/subscription"
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// A unit is either having children units when it is a organizing unit, or having children memoryPieces when it is a leaf unit.
export default async function Unit({params}) {
  const session = await getServerSession(authOptions);
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
  return <>
    <Breadcrumbs segments={breadcrumbsSegments}/>
    {isEmpty(unitChildren) && !isEmpty(memoryPieces) && session && <SubscribeButton memoryPieceIds={memoryPieces.map(memoryPiece => memoryPiece.id)} findOrCreateSubscriptionsInBatch={findOrCreateSubscriptionsInBatch} />}
  <div className="flex flex-col items-center">
  {!isEmpty(unitChildren) ? <div className="my-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {unitChildren.map((unitChild: UnitProps) => (
          <UnitCard unit={unitChild} key={unitChild.id} />
        ))
        }
      </div>
       : 
       <Table memoryPiecesStr={JSON.stringify(memoryPieces)} loggedIn={session != null}/>
}
  </div>
  </>
}
