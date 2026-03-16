import { notFound } from "next/navigation";
import { getPublicEstimateByShareCode } from "@/lib/dal/public-estimates";
import { SignEstimateClient } from "@/app/sign/[code]/SignEstimateClient";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EstimateSignPage({ params }: Props) {
  const { id } = await params;
  const estimate = await getPublicEstimateByShareCode(id);

  if (!estimate) {
    notFound();
  }

  return <SignEstimateClient estimate={estimate} />;
}
