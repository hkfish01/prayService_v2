import Link from "next/link";
export default function Navbar() {
  return (
    <nav style={{ marginBottom: 16 }}>
      <Link href="/">Home</Link> |{" "}
      <Link href="/services">Pray Service</Link> |{" "}
      <Link href="/requests">Request Pray Service</Link> |{" "}
      <Link href="/activities">Completed Transaction</Link> |{" "}
      <Link href="/profile">Profile</Link>
    </nav>
  );
} 