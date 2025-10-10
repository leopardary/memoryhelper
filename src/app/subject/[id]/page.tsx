import Breadcrumbs from "@/app/components/Breadcrumbs"
import { getDirectChildrenBySubject } from "@/lib/db/api/unit"
import UnitCard from "@/app/components/UnitCard"
import {getSubject} from "@/lib/db/api/subject"
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/utils/authOptions";
import { hasPermission } from "@/lib/utils/permissions";
import ContentManagement from '@/app/components/ContentManagement'

export default async function Subject({params}: {params: Promise<{id: string}>}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const user = session?.user;
  const subjectId = id;
  const units = await getDirectChildrenBySubject(subjectId)
  const subject = await getSubject(subjectId);

  if (subject == null) {
    return <div>Subject not found.</div>
  }

  // Check if user has manage_content permission for this subject
  const canManageContent = user?.id ? await hasPermission(user.id, 'manage_content', subjectId) : false;

  const breadcrumbs = [{url: `/`, name: 'Home'}, {url: `/subject/${subjectId}`, name: subject.title}]

  // Serialize units to plain objects for client component
  const serializedUnits = units.map(unit => ({
    _id: unit._id.toString(),
    title: unit.title,
    description: unit.description,
    imageUrls: unit.imageUrls
  }));

  return <>
    {canManageContent && (
      <ContentManagement
        type="subject"
        subjectId={subjectId}
        subjectTitle={subject.title}
        units={serializedUnits}
      />
    )}
    <Breadcrumbs segments={breadcrumbs}/>
    <div className="divider"></div>
    <div className="flex flex-col items-center">
      <div className="my-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {units.map((unit) => (
          <UnitCard unit={unit} key={unit.id} />
        ))}
      </div>
    </div>
  </>
}
