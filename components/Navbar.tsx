import Link from "next/link";
export default function Navbar() {
  return (
    <nav style={{ marginBottom: 16 }}>
      <Link href="/">Home</Link> |{" "}
      <Link href="/services">Joss paper burning service</Link> |{" "}
      <Link href="/requests">Request Joss paper burning service</Link> |{" "}
      <Link href="/activities">Completed Transaction</Link> |{" "}
      <Link href="/profile">Profile</Link>
    </nav>
  );
} 