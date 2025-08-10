import Breadcrumbs from "@/app/components/Breadcrumbs"
import { getDirectChildrenBySubject, addRootUnitForSubject } from "@/lib/db/api/unit" 
import UnitCard from "@/app/components/UnitCard"
import {getSubject} from "@/lib/db/api/subject"
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/utils/authOptions";
import AddRootUnitModal from '@/app/components/AddRootUnitModal'

export default async function Subject({params}: {params: Promise<{id: string}>}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const user = session?.user;
  let editMode = false;
  if (user?.name == "Wenjiao Wang") {
    editMode = true;
  }
  const subjectId = id;
  const units = await getDirectChildrenBySubject(subjectId)
  const subject = await getSubject(subjectId);
  if (subject == null) {
    return <div>Subject not found.</div>
  }
  const breadcrumbs = [{url: `/`, name: 'Home'}, {url: `/subject/${subjectId}`, name: subject.title}]
  return <>
  {editMode && <div className='w-full flex flex-row justify-center'><AddRootUnitModal subjectTitle={subject.title} subjectId={subjectId} addRootUnitForSubject={addRootUnitForSubject} /></div>}
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
