import Breadcrumbs from "@/app/components/Breadcrumbs"
import { getDirectChildrenBySubject } from "@/lib/db/api/unit" 
import UnitCard from "@/app/components/UnitCard"
import {getSubject} from "@/lib/db/api/subject"

export default async function Subject({params}) {
  const subjectId = params.id;
  const units = await getDirectChildrenBySubject(subjectId)
  const subject = await getSubject(subjectId);
  const breadcrumbs = [{url: `/subject/${subjectId}`, name: subject?.title}]
  return <>
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
