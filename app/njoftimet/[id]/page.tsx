import Link from "next/link";
import { NjoftimDetaj } from "@/components/NjoftimDetaj";

export const dynamic = "force-dynamic";

export default async function NjoftimPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <main><Link className="back-link" href="/">← Kthehu te njoftimet</Link><NjoftimDetaj id={id} /></main>;
}
