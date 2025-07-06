import Dashboard from '@/app/components/Dashboard/Dashboard'
import { authOptions } from "@/lib/utils/authOptions";
import { getSubscriptionWithMemoryPiecesAndChecksForUser } from '@/lib/db/api/subscription'
import { getServerSession } from "next-auth/next";

export default async function PerformanceDashboard() {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  const subscriptions = await getSubscriptionWithMemoryPiecesAndChecksForUser(user.id);

  const plainObj = Object.keys(subscriptions).reduce((obj, subscriptionId) => {
    const rawSubscription = subscriptions[subscriptionId];
    obj[subscriptionId] = {};
    obj[subscriptionId]['subscription'] = {};
    obj[subscriptionId]['subscription']['userId'] = rawSubscription['subscription'].userId.toString();
    obj[subscriptionId]['subscription']['memoryPieceId'] = rawSubscription['subscription'].memoryPieceId.toString();
    obj[subscriptionId]['subscription']['status'] = rawSubscription['subscription'].status;
    obj[subscriptionId]['subscription']['easeFactor'] = rawSubscription['subscription'].easeFactor;
    obj[subscriptionId]['subscription']['currentInterval'] = rawSubscription['subscription'].currentInterval;
    obj[subscriptionId]['subscription']['nextTestDate'] = rawSubscription['subscription'].nextTestDate;

    obj[subscriptionId]['memoryPiece'] = {};
    obj[subscriptionId]['memoryPiece']['id'] = rawSubscription['memoryPiece'].id;
    obj[subscriptionId]['memoryPiece']['content'] = rawSubscription['memoryPiece'].content;
    obj[subscriptionId]['memoryPiece']['imageUrls'] = rawSubscription['memoryPiece'].imageUrls;
    obj[subscriptionId]['memoryPiece']['description'] = rawSubscription['memoryPiece'].description;
    obj[subscriptionId]['memoryPiece']['labels'] = rawSubscription['memoryPiece'].labels;

    obj[subscriptionId]['memoryChecks'] = [];
    for (const check of rawSubscription['memoryChecks']) {
      const checkPlainObj = {};
      checkPlainObj['id'] = check.id;
      checkPlainObj['subscriptionId'] = check.subscription.toString();
      checkPlainObj['score'] = check.score;
      checkPlainObj['createdAt'] = check.createdAt;
      checkPlainObj['updatedAt'] = check.updatedAt;
      obj[subscriptionId]['memoryChecks'].push(checkPlainObj);
    }
    return obj;
  }, {});

  console.log(plainObj);
  return (<div className="flex flex-col items-center"><Dashboard record={plainObj}/></div>)
}