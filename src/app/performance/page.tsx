import Dashboard, {SubscriptionOverallRecord} from '@/app/components/Dashboard/Dashboard'
import { authOptions } from "@/lib/utils/authOptions";
import { getSubscriptionWithMemoryPiecesAndChecksForUser } from '@/lib/db/api/subscription'
import { getServerSession } from "next-auth/next";

export default async function PerformanceDashboard() {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  const subscriptions = await getSubscriptionWithMemoryPiecesAndChecksForUser(user.id);

  const plainObj: Record<string, SubscriptionOverallRecord> = Object.keys(subscriptions).reduce((obj, subscriptionId) => {
    const rawSubscription = subscriptions[subscriptionId];
    obj[subscriptionId] = {
      subscription: {
        userId: rawSubscription['subscription'].userId.toString(),
        memoryPieceId: rawSubscription['subscription'].memoryPieceId.toString(),
        status: rawSubscription['subscription'].status,
        easeFactor: rawSubscription['subscription'].easeFactor,
        currentInterval: rawSubscription['subscription'].currentInterval,
        nextTestDate: rawSubscription['subscription'].nextTestDate
      }, 
      memoryPiece: {
        id: rawSubscription['memoryPiece'].id,
        content: rawSubscription['memoryPiece'].content,
        imageUrls: rawSubscription['memoryPiece'].imageUrls,
        description: rawSubscription['memoryPiece'].description,
        labels: rawSubscription['memoryPiece'].labels
      }, 
      memoryChecks: rawSubscription['memoryChecks']?.map((memoryCheck: any) => {
        return {
          id: memoryCheck.id,
          subscriptionId: memoryCheck.subscription.toString(),
          score: memoryCheck.score,
          createdAt: memoryCheck.createdAt,
          updatedAt: memoryCheck.updatedAt
        }
      })} as SubscriptionOverallRecord;
    return obj;
  }, {});

  return (<div className="flex flex-col items-center"><Dashboard record={plainObj}/></div>)
}