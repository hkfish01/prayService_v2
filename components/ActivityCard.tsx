import React from "react";

export default function ActivityCard({ activity }: { activity: any }) {
  return (
    <div style={{ border: "1px solid #eee", margin: 8, padding: 16, width: 300 }}>
      <h3>Transaction ID: {activity.id.toString()}</h3>
      <p>Service ID: {activity.serviceId.toString()}</p>
      <p>Requester: {activity.requester.slice(0, 6)}...{activity.requester.slice(-4)}</p>
      <p>Service Provider: {activity.provider.slice(0, 6)}...{activity.provider.slice(-4)}</p>
      <p>Price: {Number(activity.amount) / 1e18} BNB</p>
      {/* <p>平台手續費: {Number(activity.platformFee) / 1e18} BNB</p> */}
      {/* <p>聯絡方式: {activity.contactInfo}</p> */}
      <p>Transaction Time: {new Date(Number(activity.timestamp) * 1000).toLocaleString()}</p>
    </div>
  );
}
