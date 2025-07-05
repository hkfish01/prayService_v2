import React from "react";

export default function ActivityCard({ activity }: { activity: Record<string, unknown> }) {
  return (
    <div style={{ border: "1px solid #eee", margin: 8, padding: 16, width: 300, backgroundColor: "#FFFFFF", borderRadius: 8 }}>
      <h3>Transaction ID: {String(activity.id)}</h3>
      <p>Service ID: {String(activity.serviceId)}</p>
      <p>Requester: {typeof activity.requester === 'string' ? activity.requester.slice(0, 6) + '...' + activity.requester.slice(-4) : ''}</p>
      <p>Service Provider: {typeof activity.provider === 'string' ? activity.provider.slice(0, 6) + '...' + activity.provider.slice(-4) : ''}</p>
      <p>Price: {activity.amount ? Number(activity.amount as string) / 1e18 : 0} BNB</p>
      {/* <p>平台手續費: {Number(activity.platformFee) / 1e18} BNB</p> */}
      {/* <p>聯絡方式: {activity.contactInfo}</p> */}
      <p>Transaction Time: {activity.timestamp ? new Date(Number(activity.timestamp) * 1000).toLocaleString() : ''}</p>
    </div>
  );
}
