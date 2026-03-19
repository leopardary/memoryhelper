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
import { hasPermission } from "@/lib/utils/permissions";
import ContentManagement from '@/app/components/ContentManagement'

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
  const user = session?.user;
  const subjectId = unit?.subject.id.toString();

  // Check if user has manage_content permission for this subject
  const canManageContent = user?.id ? await hasPermission(user.id, 'manage_content', subjectId) : false;

  if (isEmpty(unitChildren) && !isEmpty(memoryPieces) && session) {
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

  // Serialize data to plain objects for client component
  const serializedUnits = unitChildren.map((unit: any) => ({
    _id: unit._id?.toString(),
    title: unit.title,
    description: unit.description,
    imageUrls: unit.imageUrls
  }));

  const serializedMemoryPieces = memoryPieces.map((piece: any) => ({
    _id: piece._id?.toString(),
    content: piece.content,
    description: piece.description,
    imageUrls: piece.imageUrls,
    labels: piece.labels
  }));

  return <>
    {canManageContent && (
      <ContentManagement
        type="unit"
        unitId={unitId}
        unitPath={unitPath}
        subjectId={subjectId}
        hasSubUnits={hasSubUnits}
        hasMemoryPieces={hasMemoryPieces}
        units={serializedUnits}
        memoryPieces={serializedMemoryPieces}
      />
    )}
    <Breadcrumbs segments={breadcrumbsSegments}/>
    <SectionDivider title={'Details'}/>
    <ImageCarousel imageSrcs={unit.imageUrls || []} imageAlt='' />
    {hasSubUnits && <SectionDivider title={'Sub Units'} />}
    {hasMemoryPieces && memoryPieces.length > 0 && <SectionDivider title={'Memory Pieces'}/>}
    <div className="flex flex-col items-center">
    {!isEmpty(unitChildren) && unitChildren.length > 0 && <div className="my-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {unitChildren.map((unitChild: UnitProps) => <UnitCard unit={unitChild} key={unitChild._id?.toString()} />)}
        </div>}
    {!isEmpty(memoryPieces) && memoryPieces.length > 0 && <><Table memoryPiecesStr={JSON.stringify(memoryPieces)} subscriptions={subscriptions} loggedIn={session != null} findOrCreateSubscriptionsInBatch={findOrCreateSubscriptionsInBatch} removeSubscriptionsInBatch={removeSubscriptionsInBatch}/></>}
    </div>
  </>
}
