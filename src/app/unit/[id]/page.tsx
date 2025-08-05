import Breadcrumbs from "@/app/components/Breadcrumbs"
import { getUnit, parentUnitChain } from "@/lib/db/api/unit" 
import UnitCard from "@/app/components/UnitCard"
import {UnitProps} from '@/lib/db/model/types/Unit.types'
import isEmpty from 'lodash/isEmpty'
import ImageCarousel from '@/app/components/ImageCarousel'
import Table from '@/app/components/Table'
import SectionDivider from "@/app/components/SectionDivider";
import { findOrCreateSubscriptionsInBatch, getSubscriptionsForUser, removeSubscriptionsInBatch } from "@/lib/db/api/subscription"
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/utils/authOptions";
import UploadedImage from '@/app/components/UploadedImage';
import { addMemoryPieceToUnit } from '@/lib/db/api/memory-piece';
import { addSubUnit } from '@/lib/db/api/unit';
import AddContentModal from '@/app/components/UnitAddContentModal'

function getSubjectTitle(unit: any) {
  return unit?.subject.title;
}

function getChildren(unit: any) {
  return unit?.children;
}

function getMemoryPieces(unit: any) {
  return unit?.memoryPieces;
}

// A unit is either having children units when it is a organizing unit, or having children memoryPieces when it is a leaf unit.
export default async function Unit({params}: {params: Promise<{id: string}>}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const unitId = id;
  const unit = await getUnit(unitId);
  if (!unit) throw new Error(`unit not found.`);
  // get all the units from current unit's parent upto the root unit.
  const unitChain = unit?.parentUnit && await parentUnitChain(unit.parentUnit.id.toString());
  const breadcrumbsSegments = unitChain?.reverse().map(unit => {return {name: unit.title, url: `/unit/${unit.id}`};}) || [];
  // append with the current unit.
  breadcrumbsSegments.push({name: unit.title, url: `/unit/${unit.id}`});
  // prefix with the subject.
  breadcrumbsSegments.unshift({name: getSubjectTitle(unit), url: `/subject/${unit?.subject.id}`});
  // prefix with home.
  breadcrumbsSegments.unshift({name: 'Home', url: `/`});
  // The unit has either childrern unit, or memoryPieces.
  const unitChildren = getChildren(unit);
  const memoryPieces = getMemoryPieces(unit);
  const subscriptions: Record<string, boolean> = {};
  memoryPieces.forEach((memoryPiece: any) => subscriptions[memoryPiece._id] = false);
  let existingSubscriptions: string[] = [];
  if (isEmpty(unitChildren) && !isEmpty(memoryPieces) && session) {
    const user = session.user;
    // Move to a global state
    existingSubscriptions = (await getSubscriptionsForUser(user.id)).map(subscription => subscription.memoryPieceId.toString());
    memoryPieces.forEach((memoryPiece: any) => {
      const currMemoryPieceId = memoryPiece._id.toString();
      if (existingSubscriptions.indexOf(currMemoryPieceId) >= 0) {
        subscriptions[currMemoryPieceId] = true;
      }
    })
  }
  const hasSubUnits = !isEmpty(unitChildren) && unitChildren.length > 0;
  const hasMemoryPieces = !isEmpty(memoryPieces) && memoryPieces.length > 0;
  return <>
    <Breadcrumbs segments={breadcrumbsSegments}/>
    <SectionDivider title={'Details'}/>
    <ImageCarousel imageSrcs={unit.imageUrls || []} imageAlt='' />
    {hasSubUnits && <SectionDivider title={'Sub Units'} />}
    {hasMemoryPieces && memoryPieces.length > 0 && <SectionDivider title={'Memory Pieces'}/>}
    <AddContentModal unitId={unitId} addMemoryPieceToUnit={addMemoryPieceToUnit} addSubUnit={addSubUnit} hasMemoryPieces={hasMemoryPieces} hasSubUnits={hasSubUnits} />
    <div className="flex flex-col items-center">
    {!isEmpty(unitChildren) && unitChildren.length > 0 && <div className="my-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {unitChildren.map((unitChild: UnitProps) => <UnitCard unit={unitChild} key={unitChild._id?.toString()} />)}
        </div>}
    {!isEmpty(memoryPieces) && memoryPieces.length > 0 && <><UploadedImage /><Table memoryPiecesStr={JSON.stringify(memoryPieces)} subscriptions={subscriptions} loggedIn={session != null} findOrCreateSubscriptionsInBatch={findOrCreateSubscriptionsInBatch} removeSubscriptionsInBatch={removeSubscriptionsInBatch}/></>}
    </div>
  </>
}
